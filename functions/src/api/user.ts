import { Request, Response } from "express";
import * as firebase from "firebase/app";
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { db } from "../utils/admin";
import { config } from "../utils/config";
import { validateLoginData, validateSignUpData } from "../utils/validators";

firebase.initializeApp({
  ...config
});
const auth = getAuth();
connectAuthEmulator(auth, "http://localhost:9099");

// Login
export const loginUser = (request: Request, response: Response) => {
  const user = {
    email: request.body.email,
    password: request.body.password,
  };

  const { valid, errors } = validateLoginData(user);
  if (!valid) return response.status(400).json(errors);

  return signInWithEmailAndPassword(auth, user.email, user.password)
    .then((data: any) => {
      return data.user.getIdToken();
    })
    .then((token: any) => {
      return response.json({ token });
    })
    .catch((error: Error) => {
      console.error(error);
      return response.status(403).json({ error });
    });
};

export const signUpUser = (request: Request, response: Response) => {
  const newUser = {
    firstName: request.body.firstName,
    lastName: request.body.lastName,
    email: request.body.email,
    phoneNumber: request.body.phoneNumber,
    country: request.body.country,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
    username: request.body.username,
  };

  const { valid, errors } = validateSignUpData(newUser);

  if (!valid) return response.status(400).json(errors);

  return db
    .doc(`/users/${newUser.username}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return response
          .status(400)
          .json({ username: "this username is already taken" });
      } else {
        return createUserWithEmailAndPassword(
          auth,
          newUser.email,
          newUser.password
        )
          .then((data) => {
            const userId = data.user.uid;
            return data.user.getIdToken().then(() => {
              return db
                .doc(`/users/${newUser.username}`)
                .set({
                  firstName: newUser.firstName,
                  lastName: newUser.lastName,
                  username: newUser.username,
                  phoneNumber: newUser.phoneNumber,
                  country: newUser.country,
                  email: newUser.email,
                  createdAt: new Date().toISOString(),
                  userId,
                })
                .then(() => {
                  console.log("Success");
                  return response.status(200);
                })
                .catch((err) => {
                  console.error(err);
                  return response.status(500).json(err);
                });
            });
          })
          .catch((err) => {
            console.error(err);
            return response.status(500).json(err);
          });
      }
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return response.status(400).json({ email: "Email already in use" });
      }

      return response
        .status(500)
        .json({ general: "Something went wrong, please try again" });
    });
};
