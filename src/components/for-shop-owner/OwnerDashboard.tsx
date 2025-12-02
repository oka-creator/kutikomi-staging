// src/components/for-shop-owner/OwnerDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SurveyList from '@/components/for-shop-owner/SurveyList';
import ReviewList from '@/components/for-shop-owner/ReviewList';
import { supabase } from '@/utils/supabase';
import { Survey, Review } from '@/types';

const OwnerDashboard: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSurveys();
    fetchReviews();
  }, []);

  const fetchSurveys = async () => {
    const { data, error } = await supabase
      .from('surveys')
      .select('*');
    if (error) console.error('Error fetching surveys:', error);
    else setSurveys(data || []);
  };

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*');
    if (error) console.error('Error fetching reviews:', error);
    else setReviews(data || []);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredSurveys = surveys.filter(survey => 
    survey.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReviews = reviews.filter(review => 
    review.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ショップオーナーダッシュボード</h1>
      <Input
        type="text"
        placeholder="検索..."
        value={searchTerm}
        onChange={handleSearch}
        className="mb-4"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>アンケート結果</CardTitle>
          </CardHeader>
          <CardContent>
            <SurveyList surveys={filteredSurveys} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AI生成口コミ</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewList reviews={filteredReviews} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OwnerDashboard;