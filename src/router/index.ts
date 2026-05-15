import { createRouter, createWebHistory } from 'vue-router'

const EditPage = () => import('@/pages/EditPage.vue')
const EmbedPage = () => import('@/pages/EmbedPage.vue')

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/edit'
    },
    {
      path: '/edit/:id?',
      name: 'edit',
      component: EditPage
    },
    {
      path: '/embed/:id',
      name: 'embed',
      component: EmbedPage
    }
  ]
})
