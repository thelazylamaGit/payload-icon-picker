import { chromium } from '@playwright/test'

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
})

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const warnings = []
  page.on('console', (message) => {
    if (message.type() === 'warning' || message.type() === 'error') {
      warnings.push(message.text())
    }
  })
  page.on('pageerror', (error) => warnings.push(error.message))

  await page.goto('http://localhost:3000/admin')
  if (await page.locator('#field-email').isVisible()) {
    await page.locator('#field-email').fill('dev@payloadcms.com')
    await page.locator('#field-password').fill('test')
    await page.locator('.form-submit button').click()
  }

  await page.goto('http://localhost:3000/admin/collections/posts/create')
  await page.locator('.icon-picker-drawer__trigger').first().click()
  const grid = page.locator('.icon-picker-panel__grid')
  await grid.waitFor({ state: 'visible' })

  const box = await grid.boundingBox()
  if (!box) throw new Error('Grid has no bounding box')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)

  const positions = []
  for (let i = 0; i < 12; i++) {
    await page.mouse.wheel(0, 70)
    await page.waitForTimeout(90)
    positions.push(await grid.evaluate((node) => node.scrollTop))
  }

  console.log(JSON.stringify({
    gridHeight: box.height,
    positions,
    warnings: warnings.filter((message) => /flushSync|virtual|hydration|React cannot flush/i.test(message)),
  }))
} finally {
  await browser.close()
}
