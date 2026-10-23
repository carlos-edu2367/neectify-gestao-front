import { expect, test, type Page } from '@playwright/test'

const JULIANA = '00000000-0000-4000-8000-000000000105' // sem empresa, UTM nem referrer

async function entrar(page: Page) {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('carlos@neectify.com')
  await page.getByLabel('Senha').fill('senha-teste')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/funil$/)
}

const drawer = (page: Page) => page.getByRole('dialog', { name: 'Detalhe do lead' })

async function abrirJuliana(page: Page) {
  await page.getByTestId('card-lead').first().waitFor()
  await page.getByRole('link', { name: 'Juliana Prado' }).click()
  await expect(page).toHaveURL(new RegExp(`/leads/${JULIANA}$`))
  await expect(drawer(page).getByRole('heading', { name: 'Juliana Prado' })).toBeVisible()
}

test.beforeEach(async ({ page }) => {
  await entrar(page)
  await abrirJuliana(page)
})

test('campos nulos mostram "—" e nunca null/undefined', async ({ page }) => {
  const d = drawer(page)
  await expect(d.getByText('—').first()).toBeVisible()
  const texto = await page.locator('body').innerText()
  expect(texto).not.toMatch(/null|undefined/i)
  await expect(d.locator('dt', { hasText: 'Referrer' }).locator('xpath=following-sibling::dd')).toHaveText('—')
  await expect(d.locator('dt', { hasText: 'utm_source' }).locator('xpath=following-sibling::dd')).toHaveText('—')
  await expect(d.getByText('Consentimento de marketing')).toBeVisible()
})

test('link do WhatsApp abre em nova aba', async ({ page }) => {
  const link = drawer(page).getByRole('link', { name: 'Abrir conversa no WhatsApp' })
  await expect(link).toHaveAttribute('href', 'https://wa.me/5562981112233')
  await expect(link).toHaveAttribute('target', '_blank')
})

test('ESC fecha o drawer e volta ao funil', async ({ page }) => {
  await page.keyboard.press('Escape')
  await expect(drawer(page)).toHaveCount(0)
  await expect(page).toHaveURL(/\/funil$/)
})

test('adicionar nota coloca no topo da lista', async ({ page }) => {
  const d = drawer(page)
  await d.getByLabel('Nova anotação').fill('Ligar amanhã cedo')
  await d.getByRole('button', { name: 'Adicionar anotação' }).click()
  await expect(d.getByTestId('nota').first()).toContainText('Ligar amanhã cedo')
  await d.getByLabel('Nova anotação').fill('Segunda nota')
  await d.getByRole('button', { name: 'Adicionar anotação' }).click()
  await expect(d.getByTestId('nota').first()).toContainText('Segunda nota')
})

test('valor inválido bloqueia a conversão', async ({ page }) => {
  const d = drawer(page)
  await d.getByLabel('Título').fill('Organização de encomendas')
  await d.getByLabel('Valor').fill('abc')
  await expect(d.getByText('Valor inválido')).toBeVisible()
  await expect(d.getByRole('button', { name: 'Converter em projeto' })).toBeDisabled()
})

test('converte com "4.500,00" enviando "4500.00" e o lead vira Fechado', async ({ page }) => {
  const d = drawer(page)
  await d.getByLabel('Título').fill('Organização de encomendas')
  await d.getByLabel('Valor').fill('4.500,00')
  await d.getByLabel('Forma de pagamento').selectOption('PIX')
  const post = page.waitForRequest((r) => r.method() === 'POST' && /\/v1\/leads\/[\w-]+\/projeto$/.test(r.url()))
  await d.getByRole('button', { name: 'Converter em projeto' }).click()
  const body = (await post).postDataJSON()
  expect(body).toEqual({ titulo: 'Organização de encomendas', valor: '4500.00', forma_pagamento: 'PIX' })
  await expect(d.getByRole('link', { name: 'Ver em Projetos' })).toBeVisible()
  await expect(d.getByRole('button', { name: 'Converter em projeto' })).toHaveCount(0)
  await expect(d.getByLabel('Status')).toHaveValue('fechado')
  await page.keyboard.press('Escape')
  await expect(
    page.getByRole('region', { name: 'Fechado', exact: true }).locator('[data-nome="Juliana Prado"]'),
  ).toBeVisible()
})

test('segunda conversão (409) mostra "Esse lead já virou projeto."', async ({ page }) => {
  const d = drawer(page)
  await d.getByLabel('Título').fill('Organização de encomendas')
  await d.getByLabel('Valor').fill('4500')
  // outra aba/usuario converte primeiro: a tela ainda mostra o formulario
  const status = await page.evaluate(async (id) => {
    const r = await fetch(`/v1/leads/${id}/projeto`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Neectify-Client': 'painel' },
      body: JSON.stringify({ titulo: 'Primeiro', valor: '100', forma_pagamento: 'PIX' }),
    })
    return r.status
  }, JULIANA)
  expect(status).toBe(201)
  await d.getByRole('button', { name: 'Converter em projeto' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Esse lead já virou projeto.' })).toBeVisible()
})

test('status do drawer move o card no funil', async ({ page }) => {
  const d = drawer(page)
  await d.getByLabel('Status').selectOption('conversando')
  await page.keyboard.press('Escape')
  await expect(
    page.getByRole('region', { name: 'Conversando', exact: true }).locator('[data-nome="Juliana Prado"]'),
  ).toBeVisible()
})
