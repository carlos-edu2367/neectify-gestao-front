import { expect, test, type Page } from '@playwright/test'

async function entrar(page: Page, senha = 'senha-teste') {
  await page.getByLabel('E-mail').fill('carlos@neectify.com')
  await page.getByLabel('Senha').fill(senha)
  await page.getByRole('button', { name: 'Entrar' }).click()
}

test('senha errada mostra erro e continua em /login', async ({ page }) => {
  await page.goto('/login')
  await entrar(page, 'errada')
  await expect(page.getByText('E-mail ou senha incorretos.')).toBeVisible()
  await expect(page).toHaveURL(/\/login$/)
})

test('credenciais corretas levam ao painel e mostram o gestor', async ({ page }) => {
  await page.goto('/login')
  await entrar(page)
  await expect(page).toHaveURL(/\/funil$/)
  await expect(page.getByTestId('gestor-nome')).toHaveText('Carlos')
})

test('rota protegida sem sessao vai ao login e volta apos entrar', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login\?voltar=%2Fdashboard$/)
  await entrar(page)
  await expect(page).toHaveURL(/\/dashboard$/)
})

test('voltar externo e ignorado', async ({ page }) => {
  await page.goto('/login?voltar=%2F%2Fevil.com')
  await entrar(page)
  await expect(page).toHaveURL(/localhost:5174\/funil$/)
})

test('sessao expirada em /v1/leads redireciona ao login com voltar', async ({ page }) => {
  await page.goto('/login')
  await entrar(page)
  await expect(page).toHaveURL(/\/funil$/)
  await page.evaluate(() => (window as unknown as { __neectifyMock: { expireSession(): void } }).__neectifyMock.expireSession())
  // consulta feita sem recarregar a pagina
  await page.getByRole('button', { name: 'Atualizar' }).click()
  await expect(page).toHaveURL(/\/login\?voltar=%2Ffunil$/)
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
})

test('Sair chama logout e volta ao login', async ({ page }) => {
  await page.goto('/login')
  await entrar(page)
  await expect(page).toHaveURL(/\/funil$/)
  const logout = page.waitForRequest((r) => r.url().includes('/v1/auth/logout') && r.method() === 'POST')
  await page.getByRole('navigation', { name: 'Principal' }).getByText('Sair', { exact: true }).click()
  await logout
  await expect(page).toHaveURL(/\/login/)
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login\?voltar=/)
})

test('falha no logout ainda limpa a sessao local e vai ao login', async ({ page }) => {
  await page.goto('/login')
  await entrar(page)
  await expect(page).toHaveURL(/\/funil$/)
  await page.route('**/v1/auth/logout', (r) => r.fulfill({ status: 500, body: '{"detail":"x"}', contentType: 'application/json' }))
  await page.getByRole('navigation', { name: 'Principal' }).getByText('Sair', { exact: true }).click()
  await expect(page).toHaveURL(/\/login/)
})
