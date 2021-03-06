const mockState = {
  auth: {
    token: {
      unencoded: { iss: "http://geocities.com" }
    }
  }
};

jest.mock("axios", () => ({
  default: {
    interceptors: {
      response: { use: jest.fn() },
      request: { use: jest.fn() }
    },
    get() { return Promise.resolve({ data: mockState }); }
  }
}));

jest.mock("../../session", () => ({
  Session: {
    fetchStoredToken: jest.fn(),
    getAll: () => undefined,
    clear: jest.fn()
  }
}));

jest.mock("../../auth/actions", () => ({
  didLogin: jest.fn(),
  setToken: jest.fn()
}));

import { ready, storeToken } from "../actions";
import { setToken, didLogin } from "../../auth/actions";
import { Session } from "../../session";
import { auth } from "../../__test_support__/fake_state/token";

describe("Actions", () => {
  it("calls didLogin()", () => {
    jest.resetAllMocks();
    const dispatch = jest.fn();
    const getState = jest.fn(() => mockState);
    const thunk = ready();
    thunk(dispatch, getState);
    expect(setToken).toHaveBeenCalled();
  });

  it("Calls Session.clear() when missing auth", () => {
    jest.resetAllMocks();
    const dispatch = jest.fn();
    const getState = jest.fn(() => ({}));
    const thunk = ready();
    thunk(dispatch, getState);
    expect(Session.clear).toHaveBeenCalled();
  });

  it("stores token", () => {
    const old = auth;
    old.token.unencoded.jti = "old";
    const dispatch = jest.fn();
    console.warn = jest.fn();
    storeToken(old, dispatch)(undefined);
    expect(setToken).toHaveBeenCalledWith(old);
    expect(didLogin).toHaveBeenCalledWith(old, dispatch);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining(
      "Failed to refresh token"));
  });
});
