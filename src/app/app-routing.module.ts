import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomeTabsComponent } from './tabas/homeTabs.component';
import { ActionTabsComponent } from './tabas/actionTabs.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomeTabsComponent,
    children: [
      {path: 'signin', children: [{path: '', loadChildren: () => import('./home/signin/signin.module').then(m => m.SignInPageModule)}]},
      {path: 'history', children: [{path: '', loadChildren: () => import('./home/history/history.module').then(m => m.HistoryPageModule)}]},
      {path: 'sign', children: [{path: '', loadChildren: () => import('./home/sign/sign.module').then(m => m.SignPageModule)}]},
      {path: 'setting', children: [{path: '', loadChildren: () => import('./home/setting/setting.module').then(m => m.SettingPageModule)}]},
      {path: '', pathMatch: 'full', redirectTo: 'signin'}
    ]
  },
  {
    path: 'action',
    component: ActionTabsComponent,
    children: [
      {path: 'info', children: [{path: '', loadChildren: () => import('./action/info/info.module').then(m => m.InfoPageModule)}]},
      {path: 'send', children: [{path: '', loadChildren: () => import('./action/send/send.module').then(m => m.SendPageModule)}]},
      {path: '', pathMatch: 'full', redirectTo: 'info'}
    ]
  },
  {
    path: 'sub',
    children: [
      {path: 'multiSign', children: [{path: '', loadChildren: () => import('./sub/multiSign/multiSign.module').then(m => m.MultiSignPageModule)}]},
    ]
  },
  {path: '', pathMatch: 'full', redirectTo: 'home'}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
