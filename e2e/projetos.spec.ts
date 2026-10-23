import { expect, test, type Page } from '@playwright/test'

async function entrar(page: Page) {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('carlos@neectify.com')
  await page.getByLabel('Senha').fill('senha-teste')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/funil$/)
  await page.goto('/projetos')
}

test.beforeEach(async ({ page }) => {
  await entrar(page)
})

test('lista os 2 projetos com valores em BRL e link para o lead', async ({ page }) => {
  const itens = page.getByTestId('projeto')
  await expect(itens).toHaveCount(2)
  await expect(itens.nth(0)).toContainText(/R\$\s?4\.500,00/)
  await expect(itens.nth(1)).toContainText(/R\$\s?2\.200,00/)
  await expect(itens.nth(0)).toContainText('PIX')
  await expect(itens.nth(1)).toContainText('Crédito')
  await expect(itens.nth(0).getByRole('link', { name: 'Fernanda Lima' })).toHaveAttribute('href', /\/leads\//)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  expect(overflow).toBe(false)
})

test('mudar o status envia PATCH parcial com o novo status', async ({ page }) => {
  const item = page.getByTestId('projeto').nth(1)
  const req = page.waitForRequest((r) => r.method() === 'PATCH' && r.url().includes('/v1/projetos/'))
  await item.getByLabel('Status').selectOption({ label: 'Em andamento' })
  expect((await req).postDataJSON()).toEqual({ status: 'andamento' })
  await expect(item.getByLabel('Status')).toHaveValue('andamento')
})

test('salvar "Última atualização" envia o texto e atualiza o updated_at exibido', async ({ page }) => {
  const item = page.getByTestId('projeto').nth(1)
  const antes = await item.getByTestId('atualizado-em').innerText()
  await item.getByLabel('Última atualização').fill('Fotos recebidas; montando a galeria.')
  const req = page.waitForRequest((r) => r.method() === 'PATCH' && r.url().includes('/v1/projetos/'))
  await item.getByRole('button', { name: 'Salvar atualização' }).click()
  expect((await req).postDataJSON()).toEqual({ ultima_atualizacao: 'Fotos recebidas; montando a galeria.' })
  await expect(item.getByTestId('atualizado-em')).not.toHaveText(antes)
})

test('Planejamento expande e salva', async ({ page }) => {
  const item = page.getByTestId('projeto').nth(1)
  await item.getByRole('button', { name: 'Planejamento' }).click()
  await item.getByLabel('Planejamento', { exact: true }).fill('Layout, textos, publicação.')
  const req = page.waitForRequest((r) => r.method() === 'PATCH')
  await item.getByRole('button', { name: 'Salvar planejamento' }).click()
  expect((await req).postDataJSON()).toEqual({ planejamento: 'Layout, textos, publicação.' })
})
