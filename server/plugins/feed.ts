// Nitro plugin: build the RSS 2.0 feed at /feed.xml.
// Until a feedable collection exists (blog/changelog), the feed carries the
// site metadata only. Populate items in this hook when such a collection lands
// (docs/migration-nuxt-plan.md phase 7). NitroCtx arrives via module
// augmentation of 'nitropack' NitroRuntimeHooks — do not import it.
import type { Feed } from 'nuxt-module-feed'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('feed:generate', async ({ feed, options }: { feed: Feed, options: { path: string } }) => {
    if (options.path !== '/feed.xml') return

    feed.options = {
      id: 'https://lambdafolio.github.io/',
      title: 'LambdaFolio',
      description: 'A programming-language atlas: normalized facts, influences, and paradigms.',
      copyright: 'LambdaFolio contributors',
      link: 'https://lambdafolio.github.io/'
    }

    // Example of populating items later:
    //   const posts = await queryCollection(event, '...').order(...).all()
    //   posts.forEach(post => feed.addItem({ title, id, link, description, date }))
    void feed
  })
})