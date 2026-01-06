<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import BaseButton from '@/components/common/BaseButton.vue'
import './Login.css'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  username: '',
  password: ''
})

const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    errorMsg.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    const result = await userStore.login({
      username: form.value.username,
      password: form.value.password
    })

    if (result.success) {
      router.push('/workbench')
    } else {
      errorMsg.value = result.message || '登录失败'
    }
  } catch (error) {
    errorMsg.value = error.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-page__bg" />

    <div class="login-page__container">
      <div class="login-page__logo">
        <div class="login-page__logo-icon">🏥</div>
        <h1 class="login-page__logo-text">呼叫客户端</h1>
      </div>

      <div class="login-page__box">
        <h2 class="login-page__title">欢迎回来</h2>
        <p class="login-page__subtitle">请登录您的账号</p>

        <form class="login-page__form" @submit.prevent="handleLogin">
          <div class="login-page__input-group">
            <div class="login-page__input-wrapper">
              <span class="login-page__input-icon">👤</span>
              <input
                v-model="form.username"
                type="text"
                placeholder="用户名"
                class="login-page__input"
              />
            </div>
          </div>

          <div class="login-page__input-group">
            <div class="login-page__input-wrapper">
              <span class="login-page__input-icon">🔒</span>
              <input
                v-model="form.password"
                type="password"
                placeholder="密码"
                class="login-page__input"
                @keyup.enter="handleLogin"
              />
            </div>
          </div>

          <div v-if="errorMsg" class="login-page__error">
            {{ errorMsg }}
          </div>

          <BaseButton
            gradient
            size="large"
            class="login-page__submit"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </BaseButton>
        </form>
      </div>
    </div>
  </div>
</template>
