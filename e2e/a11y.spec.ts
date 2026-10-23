import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const JULIANA = '00000000-0000-4000-8000-000000000105'

async function entrar(page: Page) {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('carlos@neectify.com')
  await page.getByLabel('Senha').fill('senha-teste')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/funil$/)
}

async function violacoes(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  return r.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)
}

test('/login sem violacoes serias', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
  expect(await violacoes(page)).toEqual([])
})

test('/ (funil) sem violacoes serias', async ({ page }) => {
  await entrar(page)
  await page.getByTestId('card-lead').first().waitFor()
  expect(await violacoes(page)).toEqual([])
})

test('/leads/<id> sem violacoes serias', async ({ page }) => {
  await entrar(page)
  await page.getByTestId('card-lead').first().waitFor()
  await page.goto(`/leads/${JULIANA}`)
  await expect(page.getByRole('dialog', { name: 'Detalhe do lead' })).toBeVisible()
  expect(await violacoes(page)).toEqual([])
})

test('/dashboard sem violacoes serias', async ({ page }) => {
  await entrar(page)
  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { name: /dashboard/i }).first()).toBeVisible()
  expect(await violacoes(page)).toEqual([])
})

test('/projetos sem violacoes serias', async ({ page }) => {
  await entrar(page)
  await page.goto('/projetos')
  await expect(page.getByRole('heading', { name: /projetos/i }).first()).toBeVisible()
  expect(await violacoes(page)).toEqual([])
})
