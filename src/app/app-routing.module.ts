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
  {
    path: 'sub',
    children: [
      {path: 'accountEdit/:address', children: [{path: '', loadChildren: () => import('./sub/accountEdit/accountEdit.module').then(m => m.AccountEditPageModule)}]},
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
