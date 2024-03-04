// hooks/uselearningHistory.js
import useSWR from 'swr';
import axios from 'axios';
import Cookies from "js-cookie";

const fetcher = url => axios.get(url).then(res => res.data);
const userId = Cookies.get("user_id");

export function uselearningHistory() {
  const { data, error } = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/api/user/${userId}/learningstatus`, fetcher);

  const learnList = data ? data.readbook : [];

  return {
    learnList,
    isLoading: !error && !data,
    isError: error
  };
}
