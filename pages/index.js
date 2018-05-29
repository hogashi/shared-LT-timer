// index.js

import React, { Component } from 'react';
import Head from "katatema/head";

import Style from "./index.scss";
import TimerController from '../components/timer_controller';
import * as Constants from '../components/constants';

export default () => (
  <div id="root">
    <Head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>shared-LT-timer</title>
      <link rel="shortcut icon" type="image/x-icon" href="favicon.ico" />
      <Style />
    </Head>
    <TimerContainer />

    { /* update the version number as needed */ }
    <script defer src="https://www.gstatic.com/firebasejs/4.13.0/firebase-app.js"></script>
    { /* include only the Firebase features as you need */ }
    <script defer src="https://www.gstatic.com/firebasejs/4.13.0/firebase-auth.js"></script>
    <script defer src="https://www.gstatic.com/firebasejs/4.13.0/firebase-database.js"></script>
    <script src="https://www.gstatic.com/firebasejs/4.13.0/firebase.js"></script>
  </div>
);
