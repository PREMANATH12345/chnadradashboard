import { publicAxios, privateAxios, privateAxios1 ,mediaAxios, publicAxiosMedia} from "./axios";
import axios from 'axios';

// export const DoAll = async(data) =>{
//   const response = await privateAxios.post("/doAll", data);
//   return response;
// }

export const UploadsAws = async (data) => {
  const response = await publicAxiosMedia.post("/uploadAws", data);
  return response;
} 

const API_URL = 'https://apichandra.rxsquare.in/api/v1/dashboard';

// Helper function for authenticated requests
const authConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const ssoLogin = async ({ vendor_id, user_name }) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/ssologin`,
      { vendor_id, user_name },
      authConfig()   
);

    const data = response.data;

    if (data?.success) {
      const { vendorToken, user } = data.data;
       localStorage.clear();

      localStorage.setItem("token", vendorToken);
      localStorage.setItem("user", JSON.stringify(user));
    }

    return data;

  } catch (error) {
    console.error("SSO Login Error:", error?.response || error);

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Return backend error response if exists
    if (error.response) {
      return error.response.data;
    }

    throw error;
  }
};

export const DoAll = async (params) => {
  try {
    const response = await axios.post(`${API_URL}/doAll`, params, authConfig());
    
    return response.data;
  } catch (error) {
    console.error('DoAll Error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    throw error;
  }
};
export const vendorAPI = {
  // Get all unverified vendors
  getUnverifiedVendors: async () => {
    try {
      const response = await DoAll({
        action: 'get',
        table: 'users',
        where: {
          user_type: 'vendor',
          is_verified: 0
        },
        order_by: 'created_at DESC'
      });
      
      console.log('Unverified Vendors Response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching unverified vendors:', error);
      throw error;
    }
  },

  // Get vendor details by ID
  getVendorDetails: async (vendorId) => {
    try {
      const response = await DoAll({
        action: 'get',
        table: 'users',
        where: {
          id: vendorId,
          user_type: 'vendor'
        }
      });
      
      console.log('Vendor Details Response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching vendor details:', error);
      throw error;
    }
  },

  // Verify/Approve a vendor
  // verifyVendor: async (vendorId) => {
  //   try {
  //     const response = await DoAll({
  //       action: 'update',
  //       table: 'users',
  //       data: {
  //         is_verified: 1,
  //         email_verified: 1,
  //         updated_at: new Date().toISOString()
  //       },
  //       where: {
  //         id: vendorId,
  //         user_type: 'vendor'
  //       }
  //     });
      
  //     console.log('Verify Vendor Response:', response);
  //     return {
  //       ...response,
  //       message: 'Vendor verified successfully! They can now login.'
  //     };
  //   } catch (error) {
  //     console.error('Error verifying vendor:', error);
  //     throw error;
  //   }
  // },
  verifyVendor: async (vendorId) => {
  try {
    const response = await DoAll({
      action: 'update',
      table: 'users',
      data: {
        is_verified: 1,
        email_verified: 1,
        updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
      },
      where: {
        id: vendorId,
        user_type: 'vendor'
      }
    });

    return {
      ...response,
      message: 'Vendor verified successfully! They can now login.'
    };
  } catch (error) {
    console.error('Error verifying vendor:', error);
    throw error;
  }
},

  // Reject a vendor (optional: delete or mark as rejected)
  rejectVendor: async (vendorId) => {
    try {
      // Option 1: Delete the vendor
      const response = await DoAll({
        action: 'delete',
        table: 'users',
        where: {
          id: vendorId,
          user_type: 'vendor',
          is_verified: 0
        }
      });
      
      // Option 2: If you want to keep rejected vendors, update is_verified to -1
      /*
      const response = await DoAll({
        action: 'update',
        table: 'users',
        data: {
          is_verified: -1,
          updated_at: new Date().toISOString()
        },
        where: {
          id: vendorId,
          user_type: 'vendor'
        }
      });
      */
      
      console.log('Reject Vendor Response:', response);
      return {
        ...response,
        message: 'Vendor rejected successfully'
      };
    } catch (error) {
      console.error('Error rejecting vendor:', error);
      throw error;
    }
  },

  // Get all verified vendors (for reference)
  getVerifiedVendors: async () => {
    try {
      const response = await DoAll({
        action: 'get',
        table: 'users',
        where: {
          user_type: 'vendor',
          is_verified: 1
        },
        order_by: 'created_at DESC'
      });
      
      return response;
    } catch (error) {
      console.error('Error fetching verified vendors:', error);
      throw error;
    }
  },

  // Search vendors by various criteria
  searchVendors: async (searchParams) => {
    try {
      const { searchTerm, isVerified } = searchParams;
      
      let whereClause = {
        user_type: 'vendor'
      };
      
      if (isVerified !== undefined) {
        whereClause.is_verified = isVerified;
      }
      
      // Note: Your API might need to support LIKE queries for search
      // This is a simplified version
      if (searchTerm) {
        // You may need to adjust this based on your API's search capabilities
        whereClause.company_name = searchTerm; // or use LIKE operator if supported
      }
      
      const response = await DoAll({
        action: 'get',
        table: 'users',
        where: whereClause,
        order_by: 'created_at DESC'
      });
      
      return response;
    } catch (error) {
      console.error('Error searching vendors:', error);
      throw error;
    }
  }
};
