import { expect, test, type Page } from '@playwright/test'

type Hooks = { __neectifyMock: { failNextLeadPatch(status?: number): void; reset(): void } }

async function entrar(page: Page) {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('carlos@neectify.com')
  await page.getByLabel('Senha').fill('senha-teste')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/funil$/)
}

const coluna = (page: Page, nome: string) => page.getByRole('region', { name: nome, exact: true })

async function arrastar(page: Page, de: ReturnType<Page['locator']>, para: ReturnType<Page['locator']>) {
  const a = (await de.boundingBox())!
  const b = (await para.boundingBox())!
  await page.mouse.move(a.x + a.width / 2, a.y + 20)
  await page.mouse.down()
  await page.mouse.move(a.x + a.width / 2 + 15, a.y + 30, { steps: 4 })
  await page.mouse.move(b.x + b.width / 2, b.y + 60, { steps: 12 })
  await page.mouse.up()
}

test.beforeEach(async ({ page }) => {
  await entrar(page)
})

test('mostra as 5 colunas com contagens que somam 12', async ({ page }) => {
  const nomes = ['Novo', 'Conversando', 'Proposta enviada', 'Fechado', 'Perdido']
  let soma = 0
  for (const n of nomes) {
    const col = coluna(page, n)
    await expect(col).toBeVisible()
    const cont = Number(await col.getByTestId('contagem').innerText())
    expect(await col.getByTestId('card-lead').count()).toBe(cont)
    soma += cont
  }
  expect(soma).toBe(12)
})

test('os 2 leads parados ficam destacados', async ({ page }) => {
  await expect(page.locator('[data-parado="true"]')).toHaveCount(2)
  await expect(coluna(page, 'Novo').locator('[data-parado="true"]')).toHaveCount(2)
})

test('filtro IA mostra so leads ia; busca padaria filtra', async ({ page }) => {
  await page.getByRole('button', { name: 'IA', exact: true }).click()
  await expect(page.getByTestId('card-lead').first()).toBeVisible()
  const cats = await page.getByTestId('card-lead').evaluateAll((els) => els.map((e) => e.getAttribute('data-categoria')))
  expect(cats.length).toBeGreaterThan(0)
  expect(new Set(cats)).toEqual(new Set(['ia']))
  await page.getByRole('button', { name: 'Todos', exact: true }).click()
  await page.getByRole('searchbox', { name: 'Buscar' }).fill('padaria')
  await expect(page.getByTestId('card-lead')).toHaveCount(1)
  await expect(page.getByTestId('card-lead')).toContainText('Marcos Oliveira')
})

test('clicar no card abre /leads/:id', async ({ page }) => {
  await page.getByTestId('card-lead').first().click()
  await expect(page).toHaveURL(/\/leads\/[\w-]+$/)
})

test.describe('desktop (ponteiro fino)', () => {
  test.skip(({ isMobile }) => isMobile, 'arrastar so com ponteiro fino')

  test('arrastar de Novo para Conversando faz PATCH e move o card', async ({ page }) => {
    const card = coluna(page, 'Novo').getByTestId('card-lead').first()
    const nome = await card.getAttribute('data-nome')
    const patch = page.waitForRequest((r) => r.method() === 'PATCH' && /\/v1\/leads\//.test(r.url()))
    await arrastar(page, card, coluna(page, 'Conversando'))
    const req = await patch
    expect(req.postDataJSON()).toEqual({ status: 'conversando' })
    await expect(coluna(page, 'Conversando').locator(`[data-nome="${nome}"]`)).toBeVisible()
    await expect(coluna(page, 'Novo').locator(`[data-nome="${nome}"]`)).toHaveCount(0)
  })

  test('PATCH 500 devolve o card a Novo e mostra o aviso', async ({ page }) => {
    await page.evaluate(() => (window as unknown as Hooks).__neectifyMock.failNextLeadPatch(500))
    const card = coluna(page, 'Novo').getByTestId('card-lead').first()
    const nome = await card.getAttribute('data-nome')
    await arrastar(page, card, coluna(page, 'Conversando'))
    await expect(page.getByRole('alert')).toHaveText(/Não foi possível mover o lead\. Tente de novo\./)
    await expect(coluna(page, 'Novo').locator(`[data-nome="${nome}"]`)).toBeVisible()
    await expect(coluna(page, 'Conversando').locator(`[data-nome="${nome}"]`)).toHaveCount(0)
  })

  test('sem menu "Mover para…" no desktop', async ({ page }) => {
    await expect(page.getByRole('combobox', { name: 'Mover para…' })).toHaveCount(0)
  })
})

test.describe('celular (toque)', () => {
  test.skip(({ isMobile }) => !isMobile, 'menu so em ponteiro grosso')

  test('menu "Mover para…" muda o status com o mesmo PATCH', async ({ page }) => {
    const card = coluna(page, 'Novo').getByTestId('card-lead').first()
    const nome = await card.getAttribute('data-nome')
    const patch = page.waitForRequest((r) => r.method() === 'PATCH' && /\/v1\/leads\//.test(r.url()))
    await card.getByRole('combobox', { name: 'Mover para…' }).selectOption({ label: 'Conversando' })
    expect((await patch).postDataJSON()).toEqual({ status: 'conversando' })
    await expect(coluna(page, 'Conversando').locator(`[data-nome="${nome}"]`)).toBeVisible()
  })

  test('a pagina nao rola na horizontal', async ({ page }) => {
    const larguras = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth])
    expect(larguras[0]).toBeLessThanOrEqual(larguras[1])
  })
})
