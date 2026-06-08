import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../lib/firebase';

const POSTS_COLLECTION = 'newsletterPosts';

function normalizePost(id, data) {
  return {
    id,
    title: data.title || '',
    summary: data.summary || '',
    content: data.content || '',
    contentHtml: data.contentHtml || data.content || '',
    imageUrl: data.imageUrl || '',
    featured: Boolean(data.featured),
    publishedAt: data.publishedAt?.toDate ? data.publishedAt.toDate() : null,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : null,
  };
}

function toPostPayload(input) {
  const parsedDate = input.publishedDate ? new Date(input.publishedDate) : null;

  return {
    title: input.title.trim(),
    summary: input.summary.trim(),
    content: input.contentHtml?.trim() || input.content?.trim() || '',
    contentHtml: input.contentHtml?.trim() || input.content?.trim() || '',
    imageUrl: input.imageUrl.trim(),
    featured: Boolean(input.featured),
    publishedAt: parsedDate ? Timestamp.fromDate(parsedDate) : null,
    updatedAt: Timestamp.now(),
  };
}

function getPostsCollection() {
  if (!db) {
    throw new Error('Firebase is not configured.');
  }

  return collection(db, POSTS_COLLECTION);
}

function watchNewsletterPosts(onPosts, onError) {
  const postsQuery = query(getPostsCollection(), orderBy('publishedAt', 'desc'));

  return onSnapshot(
    postsQuery,
    (snapshot) => {
      const posts = snapshot.docs.map((item) => normalizePost(item.id, item.data()));
      onPosts(posts);
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    },
  );
}

async function createNewsletterPost(input) {
  const payload = {
    ...toPostPayload(input),
    createdAt: Timestamp.now(),
  };

  return addDoc(getPostsCollection(), payload);
}

async function updateNewsletterPost(postId, input) {
  const payload = toPostPayload(input);
  const postRef = doc(db, POSTS_COLLECTION, postId);

  return updateDoc(postRef, payload);
}

async function deleteNewsletterPost(postId) {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  return deleteDoc(postRef);
}

async function uploadNewsletterImage(file, ownerEmail) {
  if (!file) {
    throw new Error('No file selected.');
  }

  if (!storage) {
    throw new Error('Firebase Storage is not configured.');
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const ownerSegment = ownerEmail
    ? ownerEmail.replace(/[^a-zA-Z0-9._-]/g, '_')
    : 'admin';
  const objectPath = `newsletterImages/${ownerSegment}/${Date.now()}-${safeName}`;
  const imageRef = ref(storage, objectPath);

  await uploadBytes(imageRef, file, { contentType: file.type || 'image/jpeg' });
  return getDownloadURL(imageRef);
}

export {
  createNewsletterPost,
  deleteNewsletterPost,
  uploadNewsletterImage,
  updateNewsletterPost,
  watchNewsletterPosts,
};
