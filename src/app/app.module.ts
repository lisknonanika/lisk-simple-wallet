import { NgModule } from '@angular/core';
import { RouteReuseStrategy } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ToastrModule } from 'ngx-toastr';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeTabsComponent } from './tabas/homeTabs.component';
import { ActionTabsComponent } from './tabas/actionTabs.component';
import { AboutPage } from './dialog/about/about.page';
import { CreateAccountPage } from './dialog/createAccount/createAccount.page';
import { EditAccountPage } from './dialog/editAccount/editAccount.page';
import { MembersPage } from './dialog/members/members.page';
import { PassphrasePage } from './dialog/passphrase/passphrase.page';
import { TransactionPage } from './dialog/transaction/transaction.page';

@NgModule({
  declarations: [
    AppComponent,
    HomeTabsComponent,
    ActionTabsComponent,
    AboutPage,
    CreateAccountPage,
    EditAccountPage,
    MembersPage,
    PassphrasePage,
    TransactionPage
  ],
  entryComponents: [
    AboutPage,
    CreateAccountPage,
    EditAccountPage,
    MembersPage,
    PassphrasePage,
    TransactionPage
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ClipboardModule,
    ToastrModule.forRoot({ timeOut: 3000, preventDuplicates: true }),
    IonicModule.forRoot(),
    AppRoutingModule,
    IonicStorageModule.forRoot()],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
