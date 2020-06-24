import { of } from 'rxjs';
import {
  map, mergeMap, delay, catchError, throttleTime,
} from 'rxjs/operators';
import { combineEpics, ofType } from 'redux-observable';
import { ajax } from 'rxjs/ajax';

import * as actions from './actions';
import * as types from './actionTypes';

const corsProxy = 'https://cors-anywhere.herokuapp.com';
const baseUrl = `${corsProxy}/http://hrtest.alycedev.com`;
const timeInterval = 5000;

export const fetchUsersEpic = (action$) => action$.pipe(
  ofType(types.FETCH_USERS),
  mergeMap(() => ajax({
    url: `${baseUrl}/users`,
  })
    .pipe(
      map((response) => actions.fetchUsersSuccess(response.response)),
      catchError((error) => actions.displayErrorMessage(error.xhr.response)),
    )),
);

export const fetchBasketEpic = (action$) => action$.pipe(
  ofType(types.FETCH_BASKET),
  mergeMap(() => ajax({
    url: `${baseUrl}/basket`,
  })
    .pipe(
      map((response) => actions.fetchBasketSuccess(response.response)),
      catchError((error) => actions.displayErrorMessage(error.xhr.response)),
    )),
);

export const grapAppleEpic = (action$) => action$.pipe(
  ofType(types.GRAB_APPLE),
  mergeMap((action) => ajax({
    url: `${baseUrl}/users/${action.userId}/grab`,
  })
    .pipe(
      mergeMap((response) => (response.response && response.response.success ? of(
        actions.grabAppleSuccess(response.response),
        actions.fetchBasket(),
      ) : of(actions.displayErrorMessage(response.response.message || response)))),
      catchError((error) => actions.displayErrorMessage(error.xhr.response)),
    )),
);

export const freeAllApplesEpic = (action$) => action$.pipe(
  ofType(types.FREE_ALL_APPLES),
  mergeMap(() => ajax({
    url: `${baseUrl}/apples/free`,
  })
    .pipe(
      mergeMap(() => of(
        actions.fetchBasket(),
        actions.fetchUsers(),
      )),
      catchError((error) => actions.displayErrorMessage(error.xhr.response)),
    )),
);

export const hideErrorMessageEpic = (action$) => action$.pipe(
  ofType(types.DISPLAY_ERROR_MESSAGE),
  mergeMap(() => of(actions.hideErrorMessage())),
  throttleTime(timeInterval),
  delay(timeInterval),
);

export const rootEpic = combineEpics(
  fetchUsersEpic,
  fetchBasketEpic,
  grapAppleEpic,
  freeAllApplesEpic,
  hideErrorMessageEpic,
);
