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
      {path: 'accounts', children: [{path: '', loadChildren: () => import('./home/accounts/accounts.module').then(m => m.AccountsPageModule)}]},
      {path: '', pathMatch: 'full', redirectTo: 'signin'}
    ]
  },
  {
    path: 'action',
    component: ActionTabsComponent,
    children: [
      {path: 'info', children: [{path: '', loadChildren: () => import('./action/info/info.module').then(m => m.InfoPageModule)}]},
      {path: 'send', children: [{path: '', loadChildren: () => import('./action/send/send.module').then(m => m.SendPageModule)}]},
      {path: 'sign', children: [{path: '', loadChildren: () => import('./action/sign/sign.module').then(m => m.SignPageModule)}]},
      {path: '', pathMatch: 'full', redirectTo: 'info'}
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
