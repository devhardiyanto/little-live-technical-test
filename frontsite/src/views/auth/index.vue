<script lang="ts">
export const description
  = "A simple login form with email and password. The submit button says 'Sign in'."
export const iframeHeight = "600px"
export const containerClass = "w-full h-screen flex items-center justify-center px-4"
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  if (!email.value || !password.value) {
    return
  }

  isLoading.value = true
  try {
    const success = await authStore.login({
      email: email.value,
      password: password.value
    })

    if (success) {
      router.push({
        name: 'payment'
      })
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Card class="w-full max-w-sm">
    <CardHeader>
      <CardTitle class="text-2xl">
        Login
      </CardTitle>
      <CardDescription>
        Enter your email below to login to your account.
      </CardDescription>
    </CardHeader>
    <form @submit.prevent="handleLogin">
      <CardContent class="grid gap-4">
        <div class="grid gap-2">
          <Label class="mb-2" for="email">Email</Label>
          <Input
            id="email"
            v-model="email"
            type="email"
            placeholder="admin@test.com"
            required
            :disabled="isLoading"
          />
        </div>
        <div class="grid gap-2">
          <Label class="mb-2" for="password">Password</Label>
          <Input
            id="password"
            v-model="password"
            type="password"
            placeholder="admin123"
            required
            :disabled="isLoading"
          />
        </div>
        <div class="text-sm text-muted-foreground">
          <p>Test credentials:</p>
          <p>Email: admin@test.com</p>
          <p>Password: admin123</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button type="submit" class="w-full" :disabled="isLoading">
          {{ isLoading ? 'Signing in...' : 'Sign in' }}
        </Button>
      </CardFooter>
    </form>
  </Card>
</template>
