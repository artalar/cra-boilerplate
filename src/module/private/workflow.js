import { Coach } from 'coach-stm';
import middleware, { withMeta } from 'coach-stm/es/middleware';

import { STATUS } from 'shared/reference';
import { contextFactory } from 'shared/contextFactory';
import { Store } from 'shared/store';
import { setStatusLoading, setStatusLoaded, onError } from 'shared/updaters';
import * as api from 'shared/api';

const initialState = {
  permissions: [],
  status: STATUS.INITIAL,
  errorMsg: null,
};

const store = new Store(initialState);

const coach = new Coach({
  middleware: {
    store: withMeta({ store }),
    api: withMeta({ api }),
    ...middleware,
  },
});

const setPermissions = (p, { store }) => void store.merge(p);

const setLogOut = (p, { store }) => void store.merge({ permissions: [] }); // FIXME:

const selectPermissions = ({ data: { permissions } }) => ({ permissions });

const fetchGetMe = async (p, { api }) => await api.getMe(p);

export const updatePermissions = coach.goal({ selectPermissions, setPermissions });

export const getMe = coach.goal(
  'fetch user info',
  {
    setStatusLoading,
    fetchGetMe,
    updatePermissions,
    setStatusLoaded,
  },
  onError
);

export const logOut = coach.goal('log out', {
  setLogOut,
});

export const { connect: connectAuth, Provider: ProviderAuth } = contextFactory(store, {
  getMe,
});