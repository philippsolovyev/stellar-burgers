import { fetchFeeds, selectFeedOrders, selectFeedLoading } from '@slices/feedSlice';
import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { useEffect } from 'react';

import { useDispatch, useSelector } from '@services/store';

export const Feed = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const orders = useSelector(selectFeedOrders);
  const isLoading = useSelector(selectFeedLoading);

  const handleGetFeeds = (): void => {
    void dispatch(fetchFeeds());
  };

  useEffect(() => {
    handleGetFeeds();
  }, [dispatch]);

  if (isLoading || !orders.length) {
    return <Preloader />;
  }

  return <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />;
};
