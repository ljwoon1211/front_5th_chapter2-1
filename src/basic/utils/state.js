const initialState = {
  products: [],
  lastSelectedItem: null,
  bonusPoints: 0,
  totalAmount: 0,
  itemCount: 0,
};

let state = { ...initialState };

const listeners = [];

export const getState = () => ({ ...state });

export const setState = (newState) => {
  state = { ...state, ...newState };
  notifyListeners();
};

const notifyListeners = () => {
  listeners.forEach((listener) => {
    listener(getState());
  });
};

export const subscribe = (listener) => {
  listeners.push(listener);

  return () => {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
};

export const initState = (products) => {
  setState({
    ...initialState,
    products: JSON.parse(JSON.stringify(products)),
  });
};

export default {
  getState,
  setState,
  subscribe,
  initState,
};
