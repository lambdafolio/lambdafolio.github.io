<script setup lang="ts">
/**
 * Site footer: the site-wide actions that are not browsing destinations.
 *
 * The header lists collections (Languages, Families, …). What lives here is
 * different in kind — it is what a visitor does *to* the corpus rather than
 * *with* it: request something, see what is next, read the schema, take the
 * feed. Putting any of these in the top nav made it a mixed list of nouns and
 * verbs, which is why the mockups (01–04) draw the header without them and
 * this row exists separately.
 */
import { withBase } from '~/utils/with-base'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-content_header mx-4 mt-10 mb-4 pt-4 border-t border-(--ui-border-accented)">
    <div class="flex flex-wrap items-start gap-x-8 gap-y-4 text-xs">
      <div class="space-y-1.5">
        <div class="tracking-widest opacity-50">
          CONTRIBUTE
        </div>
        <NuxtLink to="/suggest" class="block text-(--link-color) hover:underline">
          Request an entry or a correction
        </NuxtLink>
        <NuxtLink to="/backlog" class="block text-(--link-color) hover:underline">
          See what is missing
        </NuxtLink>
        <a
          href="https://github.com/lambdafolio/lambdafolio.github.io"
          target="_blank"
          rel="noopener"
          class="block text-(--link-color) hover:underline"
        >Edit directly on GitHub ↗</a>
      </div>

      <div class="space-y-1.5">
        <div class="tracking-widest opacity-50">
          REFERENCE
        </div>
        <NuxtLink to="/schema" class="block text-(--link-color) hover:underline">
          Data contract
        </NuxtLink>
        <NuxtLink to="/compare" class="block text-(--link-color) hover:underline">
          Compare two languages
        </NuxtLink>
        <a :href="withBase('/feed.xml')" class="block text-(--link-color) hover:underline">
          RSS feed
        </a>
      </div>

      <div class="space-y-1.5">
        <div class="tracking-widest opacity-50">
          ABOUT
        </div>
        <p class="opacity-60 max-w-xs leading-relaxed">
          A sourced catalogue of programming languages. Facts carry a citation;
          prose is commentary and never the source of a fact.
        </p>
      </div>
    </div>

    <p class="text-xs opacity-40 mt-4">
      LambdaFolio · {{ year }} · MIT licensed · content is curated, not scraped
    </p>
  </footer>
</template>
