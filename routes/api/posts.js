const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const Profile = require("../../models/Profile");

const Post = require("../../models/Post");

const validatePostInput = require("../../validation/post");

// @route   GET api/posts/test
// @desc    Tests post route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Posts Works" }));

// @route   GET api/posts
// @desc    Get posts
// @access  Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({nopostfound: 'no post found with the id'}));
});

// @route   GET api/posts
// @desc    Get posts
// @access  Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({nopostfound: 'no posts found}));
});

// @route   POST api/posts
// @desc    Create post
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
  }
);

// @route   GET api/posts
// @desc    Get posts
// @access  Public
router.delete("/:id", passport.authenticate("jwt", { session: false }),
(req, res) => {
  Profile.findOne({user: req.user.id})
    .sort({ date: -1 })
    .then(profile => Post.findById(req.params.id).then(post => {
      if(post.user.toString() !== req.user.id)
      {
        return res.status(401).json({ notautherized: 'user not authorized' });
      }

      post.remove().then(() => res.json({success: true})).catch(err => res.status(404).json({ postnotfound: 'post was not found' }))
    }))
    .catch(err => res.status(404).json({nopostfound: 'no posts found}));
});

module.exports = router;
