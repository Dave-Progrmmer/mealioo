import Post from "../models/post.model.js";
import User from "../models/user.model.js";

export const createPost = async (req, res) => {
  try {
    const {
      title,
      desc,
      description,
      content,
      image,
      category,
      ingredients,
      instructions,
    } = req.body;
    const newPost = new Post({
      title,
      description: desc || description || content,
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

export const getPosts = async (req, res) => {
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

export const toggleFavorite = async (req, res) => {
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
