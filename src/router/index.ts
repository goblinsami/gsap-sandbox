import { createRouter, createWebHistory } from 'vue-router'
import { ROUTE_NAMES, ROUTE_PATHS } from '@/constants/routes'

const EditPage = () => import('@/pages/EditPage.vue')
const EmbedPage = () => import('@/pages/EmbedPage.vue')

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: ROUTE_PATHS.Root,
      redirect: ROUTE_PATHS.Edit
    },
    {
      path: ROUTE_PATHS.EditWithStoryId,
      name: ROUTE_NAMES.Edit,
      component: EditPage
    },
    {
      path: ROUTE_PATHS.EmbedWithStoryId,
      name: ROUTE_NAMES.Embed,
      component: EmbedPage
    }
  ]
})
