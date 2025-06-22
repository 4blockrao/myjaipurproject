
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Star, Plus, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CommunityHub = () => {
  const [posts, setPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUser();
    fetchPosts();
    fetchReviews();
  }, []);

  const fetchUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      setUser({ ...authUser, profile: data });
    }
  };

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('community_posts')
      .select(`
        *,
        profiles:user_id (full_name, rank)
      `)
      .order('created_at', { ascending: false });
    setPosts(data || []);
  };

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles:user_id (full_name, rank)
      `)
      .order('created_at', { ascending: false });
    setReviews(data || []);
  };

  const createPost = async () => {
    if (!newPost.trim() || !user) return;

    const { error } = await supabase
      .from('community_posts')
      .insert({
        user_id: user.id,
        content: newPost
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    } else {
      setNewPost('');
      fetchPosts();
      toast({
        title: "Success!",
        description: "Post created successfully"
      });
    }
  };

  const likePost = async (postId: string) => {
    if (!user) return;

    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .single();

    if (existingLike) {
      // Unlike
      await supabase
        .from('post_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);
    } else {
      // Like
      await supabase
        .from('post_likes')
        .insert({
          user_id: user.id,
          post_id: postId
        });
    }

    fetchPosts();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-600">Community Hub</CardTitle>
          <CardDescription>
            Share experiences, reviews, and connect with fellow deal hunters!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-1 mb-6">
            <Button
              variant={activeTab === 'posts' ? 'default' : 'outline'}
              onClick={() => setActiveTab('posts')}
              className="flex-1"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Posts
            </Button>
            <Button
              variant={activeTab === 'reviews' ? 'default' : 'outline'}
              onClick={() => setActiveTab('reviews')}
              className="flex-1"
            >
              <Star className="w-4 h-4 mr-2" />
              Reviews
            </Button>
          </div>

          {activeTab === 'posts' && (
            <div className="space-y-4">
              {user && (
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Share your thoughts, experiences, or ask questions..."
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <div className="flex justify-end">
                        <Button 
                          onClick={createPost}
                          disabled={!newPost.trim()}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Post
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-10 h-10 bg-gradient-to-r from-pink-500 to-yellow-500">
                          <div className="w-full h-full flex items-center justify-center text-white font-bold">
                            {post.profiles?.full_name?.[0] || 'U'}
                          </div>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{post.profiles?.full_name || 'Anonymous'}</span>
                            <Badge variant="outline" className="text-xs">
                              {post.profiles?.rank || 'Bronze'}
                            </Badge>
                            <span className="text-sm text-gray-500">{formatDate(post.created_at)}</span>
                          </div>
                          <p className="text-gray-700">{post.content}</p>
                          <div className="flex items-center space-x-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => likePost(post.id)}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <Heart className="w-4 h-4 mr-1" />
                              {post.likes_count || 0}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500">
                        <div className="w-full h-full flex items-center justify-center text-white font-bold">
                          {review.profiles?.full_name?.[0] || 'U'}
                        </div>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{review.profiles?.full_name || 'Anonymous'}</span>
                          <Badge variant="outline" className="text-xs">
                            {review.profiles?.rank || 'Bronze'}
                          </Badge>
                          <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-blue-600">{review.merchant_name}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.review_text && (
                            <p className="text-gray-700">{review.review_text}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityHub;
