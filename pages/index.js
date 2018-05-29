// index.js

import React, { Component } from 'react';
import Head from "katatema/head";

import Style from "./index.scss";
import TimerController from './components/timer_controller';

export default () => (
  <div id="root">
    <Head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>shared-LT-timer</title>
      <link rel="shortcut icon" type="image/x-icon" href="favicon.ico" />
    </Head>
    <Style />
    <TimerController />
  </div>
);
