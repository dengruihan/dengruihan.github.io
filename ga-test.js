import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:5173'

const userBehaviors = [
  {
    name: '访客A - 浏览首页',
    actions: async (page) => {
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')
      await page.screenshot({ path: 'screenshots/visitor-a-home.png' })
    }
  },
  {
    name: '访客B - 查看项目',
    actions: async (page) => {
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')
      await page.click('a[href="/projects"]')
      await page.waitForLoadState('networkidle')
      await page.screenshot({ path: 'screenshots/visitor-b-projects.png' })
      await page.click('text=GLM-Edge-V-2B Species Monitoring System')
      await page.waitForLoadState('networkidle')
      await page.screenshot({ path: 'screenshots/visitor-b-project-detail.png' })
    }
  },
  {
    name: '访客C - 阅读博客',
    actions: async (page) => {
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')
      await page.click('a[href="/blog"]')
      await page.waitForLoadState('networkidle')
      await page.screenshot({ path: 'screenshots/visitor-c-blog.png' })
      await page.click('text=杭州的')
      await page.waitForLoadState('networkidle')
      await page.screenshot({ path: 'screenshots/visitor-c-blog-detail.png' })
    }
  },
  {
    name: '访客D - 全面浏览',
    actions: async (page) => {
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')
      await page.screenshot({ path: 'screenshots/visitor-d-home.png' })
      
      await page.click('a[href="/about"]')
      await page.waitForLoadState('networkidle')
      
      await page.click('a[href="/skills"]')
      await page.waitForLoadState('networkidle')
      
      await page.click('a[href="/projects"]')
      await page.waitForLoadState('networkidle')
      await page.screenshot({ path: 'screenshots/visitor-d-projects.png' })
      
      await page.click('text=Color-Based Detection Algorithm')
      await page.waitForLoadState('networkidle')
      
      await page.click('a[href="/blog"]')
      await page.waitForLoadState('networkidle')
      await page.click('text=从课堂到湿地')
      await page.waitForLoadState('networkidle')
    }
  },
  {
    name: '访客E - 快速浏览项目',
    actions: async (page) => {
      await page.goto(`${BASE_URL}/projects`)
      await page.waitForLoadState('networkidle')
      
      try {
        const projectLinks = await page.locator('a[href^="/projects/"]').all()
        for (let i = 0; i < Math.min(2, projectLinks.length); i++) {
          await projectLinks[i].click()
          await page.waitForLoadState('networkidle')
          await page.goBack()
          await page.waitForLoadState('networkidle')
        }
      } catch (error) {
        console.log('访客E: 项目链接较少，只浏览了项目列表页')
      }
    }
  },
  {
    name: '访客F - 深度阅读博客',
    actions: async (page) => {
      await page.goto(`${BASE_URL}/blog`)
      await page.waitForLoadState('networkidle')
      
      try {
        const blogLinks = await page.locator('a[href^="/blog/"]').all()
        for (let i = 0; i < blogLinks.length; i++) {
          await blogLinks[i].click()
          await page.waitForLoadState('networkidle')
          await page.goBack()
          await page.waitForLoadState('networkidle')
        }
      } catch (error) {
        console.log('访客F: 博客链接较少，只浏览了博客列表页')
      }
    }
  },
  {
    name: '访客G - 移动端模拟',
    actions: async (page) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')
      await page.screenshot({ path: 'screenshots/visitor-g-mobile.png' })
      
      await page.click('a[href="/projects"]')
      await page.waitForLoadState('networkidle')
      
      await page.click('text=Ecological Awareness Platform')
      await page.waitForLoadState('networkidle')
    }
  },
  {
    name: '访客H - 平板端模拟',
    actions: async (page) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')
      await page.screenshot({ path: 'screenshots/visitor-h-tablet.png' })
      
      await page.click('a[href="/about"]')
      await page.waitForLoadState('networkidle')
      await page.click('a[href="/skills"]')
      await page.waitForLoadState('networkidle')
    }
  },
  {
    name: '访客I - 首页深度互动',
    actions: async (page) => {
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')
      
      await page.hover('a[href="/projects"]')
      await page.waitForTimeout(500)
      
      await page.hover('a[href="/blog"]')
      await page.waitForTimeout(500)
      
      await page.click('a[href="/projects"]')
      await page.waitForLoadState('networkidle')
      await page.click('a[href="/"]')
      await page.waitForLoadState('networkidle')
    }
  },
  {
    name: '访客J - 项目详情对比',
    actions: async (page) => {
      await page.goto(`${BASE_URL}/projects`)
      await page.waitForLoadState('networkidle')
      
      try {
        const projectLinks = await page.locator('a[href^="/projects/"]').all()
        for (let i = 0; i < projectLinks.length; i++) {
          await projectLinks[i].click()
          await page.waitForLoadState('networkidle')
          await page.waitForTimeout(1000)
          await page.goBack()
          await page.waitForLoadState('networkidle')
        }
      } catch (error) {
        console.log('访客J: 项目链接较少，只浏览了项目列表页')
      }
    }
  }
]

async function simulateUser(userId, behavior) {
  const browser = await chromium.launch({ 
    headless: true,
    channel: 'chrome'
  })
  const context = await browser.newContext({
    userAgent: `GA-Test-User-${userId} - ${behavior.name}`,
    locale: 'zh-CN'
  })
  const page = await context.newPage()
  
  console.log(`[${new Date().toLocaleTimeString()}] 开始模拟: ${behavior.name}`)
  
  try {
    await behavior.actions(page)
    console.log(`[${new Date().toLocaleTimeString()}] 完成: ${behavior.name}`)
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] 错误: ${behavior.name}`, error.message)
  } finally {
    await browser.close()
  }
}

async function runParallelGATest() {
  console.log('='.repeat(60))
  console.log('开始 GA 并行测试 - 模拟多用户访问行为')
  console.log('='.repeat(60))
  
  const totalUsers = 100
  const concurrency = 5
  
  console.log(`总用户数: ${totalUsers}, 并发数: ${concurrency}`)
  
  let completedUsers = 0
  
  for (let batch = 0; batch < Math.ceil(totalUsers / concurrency); batch++) {
    const startIndex = batch * concurrency
    const endIndex = Math.min(startIndex + concurrency, totalUsers)
    const batchUsers = []
    
    console.log(`\n[${new Date().toLocaleTimeString()}] 启动第 ${batch + 1} 批用户 (用户 ${startIndex + 1} - ${endIndex})`)
    
    for (let i = startIndex; i < endIndex; i++) {
      const behaviorIndex = i % userBehaviors.length
      const behavior = userBehaviors[behaviorIndex]
      const userId = `user-${i + 1}`
      
      batchUsers.push(
        simulateUser(userId, behavior)
          .then(() => {
            completedUsers++
            console.log(`[${new Date().toLocaleTimeString()}] 进度: ${completedUsers}/${totalUsers}`)
          })
          .catch(error => {
            completedUsers++
            console.error(`[${new Date().toLocaleTimeString()}] 用户 ${userId} 失败:`, error.message)
          })
      )
    }
    
    await Promise.all(batchUsers)
    
    if (endIndex < totalUsers) {
      console.log(`\n[${new Date().toLocaleTimeString()}] 等待 2 秒后启动下一批...`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('GA 并行测试完成!')
  console.log('='.repeat(60))
}

runParallelGATest().catch(console.error)
