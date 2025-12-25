const Post = require("../models/post.model");
const User = require("../models/user.model");

exports.createPost = async (req, res) => {
  try {
    const { title, content, image, category, ingredients, instructions } =
      req.body;
    const newPost = new Post({
      title,
      content,
      image,
      category,
      ingredients,
      instructions,
      author: req.user.id,
    });

    const post = await newPost.save();
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const postId = req.params.id;

    const index = user.favorites.indexOf(postId);
    if (index === -1) {
      user.favorites.push(postId);
    } else {
      user.favorites.splice(index, 1);
    }

    await user.save();
    res.json(user.favorites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
