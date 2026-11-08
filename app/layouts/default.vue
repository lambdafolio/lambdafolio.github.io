<template>
  <div>
    <UApp>
      <nav class="site-content_header flex items-center gap-1 px-2 pt-2">
        <NuxtLink to="/" class="flex items-center gap-2 px-2 py-1 mr-2" exact-active-class="font-semibold">
          <img
            src="/images/brand/lambdafolio-icon-96.png"
            alt=""
            width="24"
            height="24"
            class="size-6 rounded-[3px]"
          >
          <span class="text-sm font-semibold tracking-tight">LambdaFolio</span>
        </NuxtLink>
        <NuxtLink to="/" class="px-2 py-1 text-sm" exact-active-class="font-semibold underline">
          Languages
        </NuxtLink>
        <NuxtLink to="/families" class="px-2 py-1 text-sm" exact-active-class="font-semibold underline">
          Families
        </NuxtLink>
        <NuxtLink to="/generations" class="px-2 py-1 text-sm" exact-active-class="font-semibold underline">
          Generations
        </NuxtLink>
        <NuxtLink to="/paradigms" class="px-2 py-1 text-sm" exact-active-class="font-semibold underline">
          Paradigms
        </NuxtLink>
        <NuxtLink to="/compare" class="px-2 py-1 text-sm" exact-active-class="font-semibold underline">
          Compare
        </NuxtLink>
        <NuxtLink to="/schema" class="px-2 py-1 text-sm" exact-active-class="font-semibold underline">
          Data contract
        </NuxtLink>
      </nav>
      <main class="site-content">
        <slot />
      </main>
    </UApp>
  </div>
</template>