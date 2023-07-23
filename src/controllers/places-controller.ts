import fs from "fs";
import { Request, Response, NextFunction } from "express";
import { startSession } from "mongoose";
import { validationResult } from "express-validator";

import HttpError from "../shared/models/http-error";
import getCoordsForAddress from "../shared/util/location";
import Place from "../shared/models/place";
import User from "../shared/models/user";
import { CustomRequest } from "../../custom";

const getPlaceById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not find a place.", 500)
    );
  }

  if (!place) {
    return next(
      new HttpError("Could not find a place for the provided id!", 404)
    );
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.uid;

  let places;
  try {
    places = await Place.find({ creator: userId }).populate("creator");
  } catch (error) {
    return next(
      new HttpError("Fetching places failed, please try again later.", 500)
    );
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find places for the provided user id!", 404)
    );
  }

  res.json({ places: places.map((p) => p.toObject({ getters: true })) });
};

const postCreatePlace = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description, address } = req.body;

  let coordinatesFromGoogle;
  try {
    coordinatesFromGoogle = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    image: req.file?.path,
    address,
    location: coordinatesFromGoogle,
    creator: req.userData!.userId,
  });

  let user;
  try {
    user = await User.findById(req.userData!.userId);
  } catch (error) {
    return next(new HttpError("Creating place failed, please try again", 500));
  }

  if (!user) {
    return next(new HttpError("Could not find user for provided id.", 404));
  }

  try {
    const session = await startSession();
    session.startTransaction();
    await createdPlace.save({ session: session });
    user.places.push(createdPlace.id);
    await user.save({ session: session });
    await session.commitTransaction();
  } catch (error) {
    return next(new HttpError("Creating place failed, please try again", 500));
  }

  res.status(201).json({ place: createdPlace });
};

const patchUpdatePlace = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(
      new HttpError("Updating place failed, please try again later.", 500)
    );
  }

  if (!place) {
    return next(
      new HttpError("Could not find place data, please try again later", 500)
    );
  }

  if (place.creator.toString() !== req.userData!.userId) {
    return next(new HttpError("You are not allowed to edit this place.", 401));
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not update place.", 500)
    );
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not delete place.", 500)
    );
  }

  if (!place) {
    return next(new HttpError("Could not find place for this id.", 404));
  }

  if (place.creator.id.toString() !== req.userData!.userId) {
    return next(
      new HttpError("You are not allowed to delete this place.", 401)
    );
  }

  const imagePath = place.image;

  try {
    await Place.findByIdAndRemove(placeId);
    const userId = place.creator.id;
    await User.findByIdAndUpdate(
      userId,
      { $pull: { places: placeId } },
      { new: true }
    );
  } catch (error) {
    new HttpError("Something went wrong, could not delete place.", 500);
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.json({ message: "Deleted place." });
};

export default {
  getPlaceById,
  getPlacesByUserId,
  postCreatePlace,
  patchUpdatePlace,
  deletePlace,
};
