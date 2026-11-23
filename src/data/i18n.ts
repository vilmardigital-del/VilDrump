export type LanguageCode = 'PT' | 'EN' | 'ES';

export interface Translations {
  login: string;
  account: string;
  logout: string;
  promoBanner: string;
  promoUnlocked: string;
  registerBtn: string;
  seeAllRhythms: string;
  ritmo: string;
  virada: string;
  pausar: string;
  continuar: string;
  final: string;
  prato: string;
  bpm: string;
  vol: string;
  catalogTitle: string;
  catalogSearchPlaceholder: string;
  allCategories: string;
  selectedLabel: string;
  authLoginTitle: string;
  authRegisterTitle: string;
  authEmailLabel: string;
  authPasswordLabel: string;
  authNameLabel: string;
  authSubmitLogin: string;
  authSubmitRegister: string;
  authSwitchToRegister: string;
  authSwitchToLogin: string;
  close: string;
}

export const TRANSLATIONS: Record<LanguageCode, Translations> = {
  PT: {
    login: 'ENTRAR',
    account: 'CONTA',
    logout: 'SAIR',
    promoBanner: 'Se cadastre grátis para liberar tudo!',
    promoUnlocked: 'Conta ativa · Todos os ritmos liberados!',
    registerBtn: 'cadastrar',
    seeAllRhythms: 'Ver todos os ritmos',
    ritmo: 'RITMO',
    virada: 'VIRADA',
    pausar: 'PAUSAR',
    continuar: 'PAUSAR',
    final: 'FINAL',
    prato: 'PRATO',
    bpm: 'BPM',
    vol: 'VOL',
    catalogTitle: 'Todos os Ritmos',
    catalogSearchPlaceholder: 'Buscar ritmo...',
    allCategories: 'Todos',
    selectedLabel: 'Ativo',
    authLoginTitle: 'Entrar no VildDrump',
    authRegisterTitle: 'Criar conta grátis',
    authEmailLabel: 'E-mail',
    authPasswordLabel: 'Senha',
    authNameLabel: 'Nome',
    authSubmitLogin: 'Entrar',
    authSubmitRegister: 'Cadastrar grátis',
    authSwitchToRegister: 'Não tem conta? Cadastre-se grátis',
    authSwitchToLogin: 'Já tem conta? Entrar',
    close: 'Fechar',
  },
  EN: {
    login: 'SIGN IN',
    account: 'ACCOUNT',
    logout: 'SIGN OUT',
    promoBanner: 'Sign up free to unlock everything!',
    promoUnlocked: 'Account active · All rhythms unlocked!',
    registerBtn: 'sign up',
    seeAllRhythms: 'View all rhythms',
    ritmo: 'GROOVE',
    virada: 'FILL',
    pausar: 'PAUSE',
    continuar: 'PAUSE',
    final: 'ENDING',
    prato: 'CRASH',
    bpm: 'BPM',
    vol: 'VOL',
    catalogTitle: 'All Rhythms',
    catalogSearchPlaceholder: 'Search rhythm...',
    allCategories: 'All',
    selectedLabel: 'Active',
    authLoginTitle: 'Sign in to VildDrump',
    authRegisterTitle: 'Create free account',
    authEmailLabel: 'Email',
    authPasswordLabel: 'Password',
    authNameLabel: 'Name',
    authSubmitLogin: 'Sign in',
    authSubmitRegister: 'Sign up free',
    authSwitchToRegister: "Don't have an account? Sign up free",
    authSwitchToLogin: 'Already have an account? Sign in',
    close: 'Close',
  },
  ES: {
    login: 'ENTRAR',
    account: 'CUENTA',
    logout: 'SALIR',
    promoBanner: '¡Regístrate gratis para liberar todo!',
    promoUnlocked: 'Cuenta activa · ¡Todos los ritmos liberados!',
    registerBtn: 'registrar',
    seeAllRhythms: 'Ver todos los ritmos',
    ritmo: 'RITMO',
    virada: 'REDOBLE',
    pausar: 'PAUSAR',
    continuar: 'PAUSAR',
    final: 'FINAL',
    prato: 'PLATO',
    bpm: 'BPM',
    vol: 'VOL',
    catalogTitle: 'Todos los Ritmos',
    catalogSearchPlaceholder: 'Buscar ritmo...',
    allCategories: 'Todos',
    selectedLabel: 'Activo',
    authLoginTitle: 'Entrar a VildDrump',
    authRegisterTitle: 'Crear cuenta gratis',
    authEmailLabel: 'Correo',
    authPasswordLabel: 'Contraseña',
    authNameLabel: 'Nombre',
    authSubmitLogin: 'Entrar',
    authSubmitRegister: 'Registrarse gratis',
    authSwitchToRegister: '¿No tienes cuenta? Regístrate gratis',
    authSwitchToLogin: '¿Ya tienes cuenta? Entrar',
    close: 'Cerrar',
  },
};
