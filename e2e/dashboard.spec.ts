import { expect, test, type Page } from '@playwright/test'

async function entrar(page: Page) {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('carlos@neectify.com')
  await page.getByLabel('Senha').fill('senha-teste')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/funil$/)
  await page.goto('/dashboard')
}

test.beforeEach(async ({ page }) => {
  await entrar(page)
})

test('mostra os 3 indicadores', async ({ page }) => {
  const ind = page.getByTestId('indicador')
  await expect(ind).toHaveCount(3)
  await expect(ind.nth(0)).toContainText('Leads no período')
  await expect(ind.nth(1)).toContainText('Taxa de fechamento')
  await expect(ind.nth(2)).toContainText('Leads parados')
  await expect(ind.nth(2)).toContainText('2')
})

test('Por categoria e Por canal mostram todas as chaves, inclusive zeros', async ({ page }) => {
  const sec = page.getByRole('region', { name: 'Por categoria' })
  await expect(sec.getByTestId('barra-h')).toHaveCount(5)
  for (const r of [
    'Site e presença digital',
    'Automação de processos',
    'IA no meu negócio',
    'Sistema sob medida',
    'Ainda não sei, quero conversar',
  ])
    await expect(sec).toContainText(r)
  const canal = page.getByRole('region', { name: 'Por canal' })
  await expect(canal.getByTestId('barra-h')).toHaveCount(5)
  for (const r of ['Google', 'Meta', 'Indicação', 'Direto', 'Outro']) await expect(canal).toContainText(r)
})

test('trocar para 30 dias dispara GET /v1/stats?dias=30', async ({ page }) => {
  const req = page.waitForRequest((r) => r.method() === 'GET' && /\/v1\/stats\?dias=30$/.test(r.url()))
  await page.getByRole('button', { name: '30 dias' }).click()
  await req
  await expect(page.getByRole('button', { name: '30 dias' })).toHaveAttribute('aria-pressed', 'true')
})

test('rotulos de semana sao dd/MM', async ({ page }) => {
  await expect(page.getByTestId('barra-semana').first()).toHaveAttribute('title', /Semana de \d{2}\/\d{2}: \d+/)
})

test('Leads parados leva ao funil com a coluna Novo em foco', async ({ page }) => {
  await page.getByTestId('indicador').nth(2).click()
  await expect(page).toHaveURL(/\/funil\?status=novo$/)
  await expect(page.getByRole('region', { name: 'Novo', exact: true })).toHaveAttribute('data-foco', 'true')
  await expect(page.locator('[data-foco="true"]')).toHaveCount(1)
})

test('sem scroll horizontal da pagina', async ({ page }) => {
  await expect(page.getByTestId('indicador')).toHaveCount(3)
  const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth])
  expect(sw).toBeLessThanOrEqual(iw)
})
