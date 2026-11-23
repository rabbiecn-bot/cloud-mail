<template>
  <div id="login-box">
    <div class="aurora" v-if="!settingStore.settings.background">
      <div class="aurora-blob blob-a"></div>
      <div class="aurora-blob blob-b"></div>
      <div class="aurora-blob blob-c"></div>
      <div class="aurora-grid"></div>
    </div>
    <div v-else class="custom-bg" :style="background"></div>
    <div class="hero">
      <div class="hero-mark">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M4 7.5l8 6 8-6"/></svg>
      </div>
      <div class="hero-name">小莫邮局</div>
      <div class="hero-wordmark">XIAOMO&nbsp;MAIL</div>
      <p class="hero-slogan">{{ $t('loginSlogan') }}</p>
    </div>
    <div class="form-wrapper">
      <div class="container">
        <div class="brand-row">
          <div class="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M4 7.5l8 6 8-6"/></svg>
          </div>
          <div class="brand-text">
            <span class="brand-name">小莫邮局</span>
            <span class="brand-sub">XIAOMO MAIL</span>
          </div>
        </div>
        <span class="form-title">{{ settingStore.settings.title }}</span>
        <span class="form-desc" v-if="show === 'login'">{{ $t('loginTitle') }}</span>
        <span class="form-desc" v-else>{{ $t('regTitle') }}</span>
        <div v-show="show === 'login'">
          <el-input :class="settingStore.settings.loginDomain === 0 ? 'email-input' : ''" v-model="form.email"
                    type="text" :placeholder="$t('emailAccount')" autocomplete="off">
            <template #append v-if="settingStore.settings.loginDomain === 0">
              <div @click.stop="openSelect">
                <el-select
                    v-if="show === 'login'"
                    ref="mySelect"
                    v-model="suffix"
                    :placeholder="$t('select')"
                    class="select"
                >
                  <el-option
                      v-for="item in domainList"
                      :key="item"
                      :label="item"
                      :value="item"
                  />
                </el-select>
                <div style="color: var(--el-text-color-primary)">
                  <span>{{ suffix }}</span>
                  <Icon class="setting-icon" icon="mingcute:down-small-fill" width="20" height="20"/>
                </div>
              </div>
            </template>
          </el-input>
          <el-input v-model="form.password" :placeholder="$t('password')" type="password" autocomplete="off">
          </el-input>
          <el-button class="btn" type="primary" @click="submit" :loading="loginLoading"
          >{{ $t('loginBtn') }}
          </el-button>
        </div>
        <div v-show="show !== 'login'">
          <el-input class="email-input" v-model="registerForm.email" type="text" :placeholder="$t('emailAccount')"
                    autocomplete="off">
            <template #append>
              <div @click.stop="openSelect">
                <el-select
                    v-if="show !== 'login'"
                    ref="mySelect"
                    v-model="suffix"
                    :placeholder="$t('select')"
                    class="select"
                >
                  <el-option
                      v-for="item in domainList"
                      :key="item"
                      :label="item"
                      :value="item"
                  />
                </el-select>
                <div>
                  <span>{{ suffix }}</span>
                  <Icon class="setting-icon" icon="mingcute:down-small-fill" width="20" height="20"/>
                </div>
              </div>
            </template>
          </el-input>
          <el-input v-model="registerForm.password" :placeholder="$t('password')" type="password" autocomplete="off"/>
          <el-input v-model="registerForm.confirmPassword" :placeholder="$t('confirmPwd')" type="password"
                    autocomplete="off"/>
          <el-input v-if="settingStore.settings.regKey === 0" v-model="registerForm.code" :placeholder="$t('regKey')"
                    type="text" autocomplete="off"/>
          <el-input v-if="settingStore.settings.regKey === 2" v-model="registerForm.code"
                    :placeholder="$t('regKeyOptional')" type="text" autocomplete="off"/>
          <div v-show="verifyShow"
               class="register-turnstile"
               :data-sitekey="settingStore.settings.siteKey"
               data-callback="onTurnstileSuccess"
               data-error-callback="onTurnstileError"
               data-after-interactive-callback="loadAfter"
               data-before-interactive-callback="loadBefore"
          >
            <span style="font-size: 12px;color: #F56C6C" v-if="botJsError">{{ $t('verifyModuleFailed') }}</span>
          </div>
          <el-button class="btn" type="primary" @click="submitRegister" :loading="registerLoading"
          >{{ $t('regBtn') }}
          </el-button>
        </div>
        <template v-if="settingStore.settings.register === 0">
          <div class="switch" @click="show = 'register'" v-if="show === 'login'">{{ $t('noAccount') }}
            <span>{{ $t('regSwitch') }}</span></div>
          <div class="switch" @click="show = 'login'" v-else>{{ $t('hasAccount') }} <span>{{ $t('loginSwitch') }}</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import router from "@/router";
import {computed, nextTick, reactive, ref} from "vue";
import {login} from "@/request/login.js";
import {register} from "@/request/login.js";
import {isEmail} from "@/utils/verify-utils.js";
import {useSettingStore} from "@/store/setting.js";
import {useAccountStore} from "@/store/account.js";
import {useUserStore} from "@/store/user.js";
import {useUiStore} from "@/store/ui.js";
import {Icon} from "@iconify/vue";
import {cvtR2Url} from "@/utils/convert.js";
import {loginUserInfo} from "@/request/my.js";
import {permsToRouter} from "@/perm/perm.js";
import {useI18n} from "vue-i18n";

const {t} = useI18n();
const accountStore = useAccountStore();
const userStore = useUserStore();
const uiStore = useUiStore();
const settingStore = useSettingStore();
const loginLoading = ref(false)
const show = ref('login')
const form = reactive({
  email: '',
  password: '',

});
const mySelect = ref()
const suffix = ref('')
const registerForm = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  code: null
})
const domainList = settingStore.domainList;
const registerLoading = ref(false)
suffix.value = domainList[0]
const verifyShow = ref(false)
let verifyToken = ''
let turnstileId = null
let botJsError = ref(false)
let verifyErrorCount = 0

window.onTurnstileSuccess = (token) => {
  verifyToken = token;
};

window.onTurnstileError = (e) => {
  if (verifyErrorCount >= 4) {
    return
  }
  verifyErrorCount++
  console.warn('人机验加载失败', e)
  setTimeout(() => {
    nextTick(() => {
      if (!turnstileId) {
        turnstileId = window.turnstile.render('.register-turnstile')
      } else {
        window.turnstile.reset(turnstileId);
      }
    })
  }, 1500)
};

window.loadAfter = (e) => {
  console.log('loadAfter')
}

window.loadBefore = (e) => {
  console.log('loadBefore')
}

const loginOpacity = computed(() => {
  const opacity = settingStore.settings.loginOpacity
  return uiStore.dark ? `rgba(0, 0, 0, ${opacity})` : `rgba(255, 255, 255, ${opacity})`
})

const background = computed(() => {

  return settingStore.settings.background ? {
    'background-image': `url(${cvtR2Url(settingStore.settings.background)})`,
    'background-repeat': 'no-repeat',
    'background-size': 'cover',
    'background-position': 'center'
  } : ''
})


const openSelect = () => {
  mySelect.value.toggleMenu()
}

const submit = () => {

  if (!form.email) {
    ElMessage({
      message: t('emptyEmailMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  let email = form.email + (settingStore.settings.loginDomain === 0 ? suffix.value : '');

  if (!isEmail(email)) {
    ElMessage({
      message: t('notEmailMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  if (!form.password) {
    ElMessage({
      message: t('emptyPwdMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  loginLoading.value = true
  login(email, form.password).then(async data => {
    localStorage.setItem('token', data.token)
    const user = await loginUserInfo();
    accountStore.currentAccountId = user.accountId;
    userStore.user = user;
    const routers = permsToRouter(user.permKeys);
    routers.forEach(routerData => {
      router.addRoute('layout', routerData);
    });
    await router.replace({name: 'layout'})
    uiStore.showNotice()
  }).finally(() => {
    loginLoading.value = false
  })
}


function submitRegister() {

  if (!registerForm.email) {
    ElMessage({
      message: t('emptyEmailMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  if (!isEmail(registerForm.email + suffix.value)) {
    ElMessage({
      message: t('notEmailMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  if (!registerForm.password) {
    ElMessage({
      message: t('emptyPwdMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  if (registerForm.password.length < 6) {
    ElMessage({
      message: t('pwdLengthMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  if (registerForm.password !== registerForm.confirmPassword) {

    ElMessage({
      message: t('confirmPwdFailMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  if (settingStore.settings.regKey === 0) {

    if (!registerForm.code) {

      ElMessage({
        message: t('emptyRegKeyMsg'),
        type: 'error',
        plain: true,
      })
      return
    }

  }

  if (!verifyToken && (settingStore.settings.registerVerify === 0 || (settingStore.settings.registerVerify === 2 && settingStore.settings.regVerifyOpen))) {
    if (!verifyShow.value) {
      verifyShow.value = true
      nextTick(() => {
        if (!turnstileId) {
          try {
            turnstileId = window.turnstile.render('.register-turnstile')
          } catch (e) {
            botJsError.value = true
            console.log('人机验证js加载失败')
          }
        } else {
          window.turnstile.reset('.register-turnstile')
        }
      })
    } else if (!botJsError.value) {
      ElMessage({
        message: t('botVerifyMsg'),
        type: "error",
        plain: true
      })
    }
    return;
  }

  registerLoading.value = true

  const form = {
    email: registerForm.email + suffix.value,
    password: registerForm.password,
    token: verifyToken,
    code: registerForm.code
  }

  register(form).then(({regVerifyOpen}) => {
    show.value = 'login'
    registerForm.email = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''
    registerForm.code = ''
    registerLoading.value = false
    verifyToken = ''
    settingStore.settings.regVerifyOpen = regVerifyOpen
    verifyShow.value = false
    ElMessage({
      message: t('regSuccessMsg'),
      type: 'success',
      plain: true,
    })
  }).catch(res => {

    registerLoading.value = false

    if (res.code === 400) {
      verifyToken = ''
      settingStore.settings.regVerifyOpen = true
      if (turnstileId) {
        window.turnstile.reset(turnstileId)
      } else {
        nextTick(() => {
          turnstileId = window.turnstile.render('.register-turnstile')
        })
      }
      verifyShow.value = true

    }
  });
}

</script>


<style>
.el-select-dropdown__item {
  padding: 0 15px;
}

.no-autofill-pwd {
  .el-input__inner {
    -webkit-text-security: disc !important;
  }
}
</style>

<style lang="scss" scoped>

#login-box {
  position: relative;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #060a16;
  font-family: inherit;
}

/* ---------- 背景：深邃极光（未设置自定义背景图时） ---------- */
.aurora {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: linear-gradient(155deg, #0c1230 0%, #080d1f 46%, #05090f 100%);
}

.aurora-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  will-change: transform;
}

.blob-a {
  width: 56vw;
  height: 56vw;
  left: -14vw;
  top: -18vw;
  background: radial-gradient(circle at 35% 35%, rgba(99, 102, 241, 0.55), rgba(99, 102, 241, 0) 65%);
  animation: drift-a 26s ease-in-out infinite alternate;
}

.blob-b {
  width: 44vw;
  height: 44vw;
  left: 22vw;
  bottom: -22vw;
  background: radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.42), rgba(139, 92, 246, 0) 65%);
  animation: drift-b 32s ease-in-out infinite alternate;
}

.blob-c {
  width: 30vw;
  height: 30vw;
  right: 6vw;
  top: -10vw;
  background: radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.30), rgba(34, 211, 238, 0) 65%);
  animation: drift-a 38s ease-in-out infinite alternate-reverse;
}

@keyframes drift-a {
  from { transform: translate3d(0, 0, 0) scale(1); }
  to   { transform: translate3d(6vw, 4vh, 0) scale(1.12); }
}

@keyframes drift-b {
  from { transform: translate3d(0, 0, 0) scale(1.05); }
  to   { transform: translate3d(-5vw, -5vh, 0) scale(0.94); }
}

.aurora-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.13) 1px, transparent 1.4px);
  background-size: 26px 26px;
  -webkit-mask-image: radial-gradient(ellipse 90% 80% at 38% 42%, #000 30%, transparent 75%);
  mask-image: radial-gradient(ellipse 90% 80% at 38% 42%, #000 30%, transparent 75%);
}

.aurora::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 120% 90% at 50% 110%, transparent 55%, rgba(2, 4, 10, 0.55) 100%);
}

/* ---------- 自定义背景图 ---------- */
.custom-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
}

.custom-bg::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, rgba(4, 8, 18, 0.42) 0%, rgba(4, 8, 18, 0.10) 55%, rgba(4, 8, 18, 0.28) 100%);
}

/* ---------- 左侧品牌区（桌面） ---------- */
.hero {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 6.5vw;
  max-width: 600px;
  pointer-events: none;
  animation: hero-in 0.9s cubic-bezier(0.22, 0.8, 0.3, 1) both;
  @media (max-width: 1024px) {
    display: none;
  }
}

@keyframes hero-in {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

.hero-mark {
  width: 58px;
  height: 58px;
  border-radius: 17px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #06b6d4 130%);
  box-shadow: 0 18px 38px -12px rgba(99, 102, 241, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.35);
  margin-bottom: 30px;

  svg {
    width: 30px;
    height: 30px;
  }
}

.hero-name {
  font-size: 58px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.15;
  color: #fff;
  text-shadow: 0 6px 34px rgba(3, 6, 18, 0.45);
}

.hero-wordmark {
  margin-top: 14px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.52em;
  color: rgba(255, 255, 255, 0.55);
}

.hero-slogan {
  margin-top: 22px;
  font-size: 16.5px;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.74);
  max-width: 400px;
}

/* ---------- 右侧表单 ---------- */
.form-wrapper {
  position: fixed;
  right: 0;
  height: 100%;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  @media (max-width: 767px) {
    width: 100%;
  }
}

.container {
  background: v-bind(loginOpacity);
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
  padding-left: 46px;
  padding-right: 46px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 460px;
  height: 100%;
  border-left: 1px solid rgba(133, 147, 180, 0.28);
  box-shadow: -28px 0 70px rgba(2, 6, 17, 0.28);
  animation: panel-in 0.7s cubic-bezier(0.22, 0.8, 0.3, 1) both;
  @media (max-width: 1024px) {
    padding: 20px 18px;
    width: 384px;
    margin-left: 18px;
  }
  @media (max-width: 767px) {
    border: 1px solid rgba(133, 147, 180, 0.35);
    padding: 26px 22px;
    border-radius: 20px;
    height: fit-content;
    width: 100%;
    margin-right: 18px;
    margin-left: 18px;
    box-shadow: 0 30px 70px -18px rgba(2, 6, 17, 0.5);
  }

  .brand-row {
    display: flex;
    align-items: center;
    gap: 13px;
    margin-bottom: 36px;
  }

  .brand-mark {
    width: 42px;
    height: 42px;
    flex: none;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #06b6d4 130%);
    box-shadow: 0 10px 22px -8px rgba(99, 102, 241, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.35);

    svg {
      width: 23px;
      height: 23px;
    }
  }

  .brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1.25;
  }

  .brand-name {
    font-size: 17.5px;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: var(--el-text-color-primary);
  }

  .brand-sub {
    font-size: 9.5px;
    font-weight: 600;
    letter-spacing: 0.42em;
    color: var(--form-desc-color);
  }

  .form-title {
    font-weight: 750;
    font-size: 25px !important;
    letter-spacing: 0.01em;
  }

  .form-desc {
    margin-top: 7px;
    margin-bottom: 28px;
    font-size: 13.5px;
    color: var(--form-desc-color);
  }

  .el-input {
    height: 46px;
    width: 100%;
    margin-bottom: 16px;

    :deep(.el-input__inner) {
      height: 44px;
      font-size: 14.5px;
    }
  }

  :deep(.el-input__wrapper) {
    border-radius: 12px;
    background: var(--el-bg-color);
    box-shadow: 0 0 0 1px var(--el-border-color) inset;
    transition: box-shadow 0.2s ease;
  }

  :deep(.el-input__wrapper:hover) {
    box-shadow: 0 0 0 1px var(--el-border-color-hover) inset;
  }

  :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 0 4px rgba(99, 102, 241, 0.16);
  }

  .email-input :deep(.el-input__wrapper) {
    border-radius: 12px 0 0 12px;
    background: var(--el-bg-color);
  }

  .btn {
    height: 46px;
    width: 100%;
    margin-top: 6px;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.14em;
    color: #fff;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #9333ea 100%);
    box-shadow: 0 14px 28px -10px rgba(109, 72, 237, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.25);
    transition: transform 0.18s ease, filter 0.18s ease, box-shadow 0.18s ease;
  }

  .btn:hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
    box-shadow: 0 18px 34px -10px rgba(109, 72, 237, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.25);
  }

  .btn:active {
    transform: translateY(0);
    filter: brightness(0.98);
  }

  .switch {
    margin-top: 24px;
    text-align: center;
    font-size: 13.5px;
    color: var(--form-desc-color);

    span {
      color: var(--login-switch-color);
      font-weight: 600;
      cursor: pointer;
    }

    span:hover {
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  }
}

@keyframes panel-in {
  from { opacity: 0; transform: translateX(22px); }
  to   { opacity: 1; transform: translateX(0); }
}

:deep(.el-select-dropdown__item) {
  padding: 0 10px;
}

.setting-icon {
  position: relative;
  top: 6px;
}

:deep(.el-input-group__append) {
  padding: 0 !important;
  padding-left: 8px !important;
  padding-right: 4px !important;
  background: var(--el-bg-color);
  border-radius: 0 12px 12px 0;
  box-shadow: 0 0 0 1px var(--el-border-color) inset;
}

.register-turnstile {
  margin-bottom: 18px;
}

.select {
  position: absolute;
  right: 30px;
  width: 100px;
  opacity: 0;
  pointer-events: none;
}

.custom-style {
  margin-bottom: 10px;
}

.custom-style .el-segmented {
  --el-border-radius-base: 6px;
  width: 180px;
}

@media (prefers-reduced-motion: reduce) {
  .aurora-blob, .hero, .container {
    animation: none;
  }
}

</style>
