const initialState = {
  good: 0,
  ok: 0,
  bad: 0,
};

const counterReducer = (state = initialState, action) => {
  const changedState = { ...state };
  switch (action.type) {
    case "GOOD":
      changedState.good++;
      break;
    case "OK":
      changedState.ok++;
      break;
    case "BAD":
      changedState.bad++;
      break;
    case "ZERO":
      changedState.good = 0;
      changedState.bad = 0;
      changedState.ok = 0;
  }
  return changedState;
};

export default counterReducer;
