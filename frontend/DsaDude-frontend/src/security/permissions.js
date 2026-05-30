// security/permissions.js

export const ROLES = {
  ADMIN: "ADMIN",
  PROBLEM_SETTER: "PROBLEM_SETTER",
  USER: "USER",
};

export const ROUTE_PERMISSIONS = {
  "/profile": [
    ROLES.ADMIN,
    ROLES.PROBLEM_SETTER,
    ROLES.USER,
  ],

  "/submissions": [
    ROLES.ADMIN,
    ROLES.PROBLEM_SETTER,
    ROLES.USER,
  ],

  "/contributions": [
    ROLES.ADMIN,
    ROLES.PROBLEM_SETTER,
  ],

  "/problem/edit": [
    ROLES.ADMIN,
    ROLES.PROBLEM_SETTER,
  ],

  "/problem/add": [
    ROLES.ADMIN,
    ROLES.PROBLEM_SETTER,
  ],
};