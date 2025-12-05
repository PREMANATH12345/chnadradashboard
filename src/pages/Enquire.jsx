import { DoAll } from "../auth/api"
import { useState , useEffect} from "react";
import toast from "react-hot-toast";

const EnquiryPage
 = () => {
      const [enquiry, setEnquiry] = useState([]);
      const [loading, setLoading] = useState(false)
        const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await DoAll({ 
        action: 'get', 
        table: 'enquiries' 
      });
      
      if (!response?.data?.success) {
        throw new Error('Invalid API response structure');
      }
      
      const categoriesData = response.data.data || [];
      setEnquiry(categoriesData);
      

    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error loading categories');
    } finally {
      setLoading(false);
    }
  };
console.log(enquiry)
    useEffect(() => {
      const loadData = async () => {
        await fetchCategories();
      };
      loadData();
    }, []);

    
}

export default EnquiryPage