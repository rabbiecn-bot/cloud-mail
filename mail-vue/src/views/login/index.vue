<template>
  <div id="login-box">
    <div v-if="settingStore.settings.background" class="custom-bg" :style="background"></div>
    <div class="form-wrapper">
      <div class="container">
        <aside class="brand-panel">
          <div class="brand-logo">
            <svg width="31" height="31" viewBox="0 0 24 24" fill="none"><rect x="2.5" y="5" width="19" height="14" rx="3" stroke="#fff" stroke-width="1.8"/><path d="M3.5 7.5 12 13l8.5-5.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>
          </div>
          <div class="brand-name">{{ settingStore.settings.title }}</div>
          <div class="brand-en">XIAOMO MAIL</div>
          <div class="brand-bottom">
            <p class="brand-slogan">{{ $t('loginSlogan') }}</p>
            <div class="brand-feats">
              <span>{{ $t('loginFeatDomain') }}</span>
              <span>{{ $t('loginFeatAttach') }}</span>
              <span>{{ $t('loginFeatStar') }}</span>
            </div>
          </div>
        </aside>
        <main class="form-main">
          <div class="form-head">
            <span class="form-title" v-if="show === 'login'">{{ $t('loginWelcome') }}</span>
            <span class="form-title" v-else>{{ $t('regSwitch') }}</span>
            <span class="form-desc" v-if="show === 'login'">{{ $t('loginTitle') }}</span>
            <span class="form-desc" v-else>{{ $t('regTitle') }}</span>
          </div>
          <div v-show="show === 'login'">
            <label class="field-label">{{ $t('emailLabel') }}</label>
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
                  <div style="color: #404040">
                    <span>{{ suffix }}</span>
                    <Icon class="setting-icon" icon="mingcute:down-small-fill" width="20" height="20"/>
                  </div>
                </div>
              </template>
            </el-input>
            <label class="field-label">{{ $t('password') }}</label>
            <el-input v-model="form.password" :placeholder="$t('password')" type="password" autocomplete="off">
            </el-input>
            <el-button class="btn" type="primary" @click="submit" :loading="loginLoading"
            >{{ $t('loginBtn') }}
            </el-button>
          </div>
          <div v-show="show !== 'login'">
            <label class="field-label">{{ $t('emailLabel') }}</label>
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
            <label class="field-label">{{ $t('password') }}</label>
            <el-input v-model="registerForm.password" :placeholder="$t('password')" type="password" autocomplete="off"/>
            <label class="field-label">{{ $t('confirmPwd') }}</label>
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
        </main>
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
  background-color: #fafafa;
  background-image: linear-gradient(#efefef 1px, transparent 1px), linear-gradient(90deg, #efefef 1px, transparent 1px);
  background-size: 56px 56px;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.custom-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
}

.form-wrapper {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow-y: auto;
}

.container {
  background: v-bind(loginOpacity);
  display: flex;
  width: 1020px;
  max-width: 100%;
  min-height: 620px;
  border: 1px solid #e6e6e6;
  border-radius: 24px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.07);
  overflow: hidden;
  margin: auto;
}

.brand-panel {
  width: 43%;
  flex-shrink: 0;
  background: #f7f7f7;
  border-right: 1px solid #ececec;
  padding: 56px 52px;
  display: flex;
  flex-direction: column;
}

.brand-logo {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: #171717;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-name {
  font-size: 44px;
  font-weight: 700;
  letter-spacing: 3px;
  line-height: 1.25;
  color: #171717;
  margin-top: 32px;
  word-break: break-all;
}

.brand-en {
  font-size: 13px;
  letter-spacing: 8px;
  color: #8a8a8a;
  margin-top: 12px;
}

.brand-bottom {
  margin-top: auto;
}

.brand-slogan {
  font-size: 17px;
  line-height: 1.8;
  color: #525252;
  font-weight: 300;
}

.brand-feats {
  margin-top: 22px;
  display: flex;
  gap: 9px;
  flex-wrap: wrap;

  span {
    font-size: 13px;
    padding: 6px 13px;
    border-radius: 999px;
    border: 1px solid #dcdcdc;
    color: #666;
    background: #fff;
  }
}

.form-main {
  flex: 1;
  min-width: 0;
  padding: 56px 62px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-head {
  display: flex;
  flex-direction: column;
}

.form-title {
  font-size: 26px;
  font-weight: 700;
  color: #171717;
}

.form-desc {
  margin-top: 8px;
  color: #8a8a8a;
  font-size: 14.5px;
}

.field-label {
  display: block;
  font-size: 13.5px;
  color: #525252;
  margin: 20px 0 8px;
  font-weight: 500;
}

.container {
  .btn {
    margin-top: 26px;
    height: 52px;
    width: 100%;
    border-radius: 11px;
    background: #171717;
    border-color: #171717;
    color: #fff;
    font-size: 16.5px;
    font-weight: 600;
    letter-spacing: 4px;
  }

  .btn:hover, .btn:focus {
    background: #000;
    border-color: #000;
    color: #fff;
  }

  .switch {
    margin-top: 22px;
    text-align: center;
    font-size: 14px;
    color: #8a8a8a;

    span {
      color: #171717;
      font-weight: 600;
      cursor: pointer;
    }
  }

  :deep(.el-input__wrapper) {
    border-radius: 11px;
    background: #fff;
    box-shadow: 0 0 0 1px #dcdcdc inset;
  }

  :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px #171717 inset, 0 0 0 4px rgba(23, 23, 23, 0.08);
  }

  .email-input :deep(.el-input__wrapper) {
    border-radius: 11px 0 0 11px;
  }

  .el-input {
    height: 50px;
    width: 100%;

    :deep(.el-input__inner) {
      height: 48px;
      color: #171717;
    }
  }
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
  padding-left: 12px !important;
  padding-right: 10px !important;
  background: #fff;
  box-shadow: 0 0 0 1px #dcdcdc inset;
  border-radius: 0 11px 11px 0;
  color: #404040;
}

.register-turnstile {
  margin-top: 18px;
}

.select {
  position: absolute;
  right: 30px;
  width: 100px;
  opacity: 0;
  pointer-events: none;
}

@media (max-width: 1024px) {
  .brand-panel {
    padding: 44px 36px;
  }

  .brand-name {
    font-size: 36px;
  }

  .form-main {
    padding: 44px 36px;
  }
}

@media (max-width: 767px) {
  .form-wrapper {
    padding: 14px;
  }

  .container {
    flex-direction: column;
    min-height: 0;
    width: 100%;
  }

  .brand-panel {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #ececec;
    padding: 30px 26px 24px;
  }

  .brand-logo {
    width: 48px;
    height: 48px;
    border-radius: 13px;
  }

  .brand-name {
    font-size: 30px;
    margin-top: 20px;
  }

  .brand-bottom {
    margin-top: 22px;
  }

  .brand-slogan {
    font-size: 15px;
  }

  .form-main {
    padding: 28px 22px 32px;
  }
}

</style>
