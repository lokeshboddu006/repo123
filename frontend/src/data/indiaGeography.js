/**
 * ============================================================
 * Central India Geography Dataset — GovComm AI
 * Single source of truth for all 28 States & 8 Union Territories
 * with official district classifications.
 * ============================================================
 */

export const INDIAN_STATES = [
  {
    id: 'andhra-pradesh',
    name: 'Andhra Pradesh',
    type: 'State',
    districts: [
      'Anakapalli', 'Ananthapuramu', 'Annamayya', 'Bapatla', 'Chittoor',
      'East Godavari', 'Eluru', 'Guntur', 'Kakinada', 'Konaseema',
      'Krishna', 'Kurnool', 'NTR', 'Nandyal', 'Palnadu',
      'Parvathipuram Manyam', 'Prakasam', 'Sri Potti Sriramulu Nellore',
      'Sri Sathya Sai', 'Srikakulam', 'Tirupati', 'Visakhapatnam',
      'Vizianagaram', 'West Godavari', 'YSR Kadapa'
    ]
  },
  {
    id: 'arunachal-pradesh',
    name: 'Arunachal Pradesh',
    type: 'State',
    districts: [
      'Anjaw', 'Changlang', 'Dibang Valley', 'East Kameng', 'East Siang',
      'Kamle', 'Kra Daadi', 'Kurung Kumey', 'Leparada', 'Lohit',
      'Longding', 'Lower Dibang Valley', 'Lower Siang', 'Lower Subansiri',
      'Namsai', 'Pakke Kessang', 'Papum Pare', 'Shi Yomi', 'Siang',
      'Tawang', 'Tirap', 'Upper Siang', 'Upper Subansiri', 'West Kameng',
      'West Siang', 'Itanagar'
    ]
  },
  {
    id: 'assam',
    name: 'Assam',
    type: 'State',
    districts: [
      'Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar',
      'Charaideo', 'Chirang', 'Darrang', 'Dhemaji', 'Dhubri',
      'Dibrugarh', 'Dima Hasao', 'Goalpara', 'Golaghat', 'Hailakandi',
      'Hojai', 'Jorhat', 'Kamrup', 'Kamrup Metropolitan', 'Karbi Anglong',
      'Karimganj', 'Kokrajhar', 'Lakhimpur', 'Majuli', 'Morigaon',
      'Nagaon', 'Nalbari', 'Sivasagar', 'Sonitpur', 'South Salmara-Mankachar',
      'Tinsukia', 'Udalguri', 'West Karbi Anglong'
    ]
  },
  {
    id: 'bihar',
    name: 'Bihar',
    type: 'State',
    districts: [
      'Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai',
      'Bhagalpur', 'Bhojpur', 'Buxar', 'Darbhanga', 'East Champaran',
      'Gaya', 'Gopalganj', 'Jamui', 'Jehanabad', 'Kaimur',
      'Katihar', 'Khagaria', 'Kishanganj', 'Lakhisarai', 'Madhepura',
      'Madhubani', 'Munger', 'Muzaffarpur', 'Nalanda', 'Nawada',
      'Patna', 'Purnia', 'Rohtas', 'Saharsa', 'Samastipur',
      'Saran', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan',
      'Supaul', 'Vaishali', 'West Champaran'
    ]
  },
  {
    id: 'chhattisgarh',
    name: 'Chhattisgarh',
    type: 'State',
    districts: [
      'Balod', 'Baloda Bazar', 'Balrampur', 'Bastar', 'Bemetara',
      'Bijapur', 'Bilaspur', 'Dantewada', 'Dhamtari', 'Durg',
      'Gariaband', 'Gaurela-Pendra-Marwahi', 'Janjgir-Champa', 'Jashpur',
      'Kabirdham', 'Kanker', 'Khairagarh-Chhuikhadan-Gandai', 'Kondagaon',
      'Korba', 'Koriya', 'Mahasamund', 'Manendragarh-Chirmiri-Bharatpur',
      'Mohla-Manpur-Ambagarh Chowki', 'Mungeli', 'Narayanpur', 'Raigarh',
      'Raipur', 'Rajnandgaon', 'Sarangarh-Bilaigarh', 'Sakti', 'Sukma',
      'Surajpur', 'Surguja'
    ]
  },
  {
    id: 'goa',
    name: 'Goa',
    type: 'State',
    districts: ['North Goa', 'South Goa']
  },
  {
    id: 'gujarat',
    name: 'Gujarat',
    type: 'State',
    districts: [
      'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha',
      'Bharuch', 'Bhavnagar', 'Botad', 'Chhota Udaipur', 'Dahod',
      'Dang', 'Devbhumi Dwarka', 'Gandhinagar', 'Gir Somnath', 'Jamnagar',
      'Junagadh', 'Kheda', 'Kutch', 'Mahisagar', 'Mehsana',
      'Morbi', 'Narmada', 'Navsari', 'Panchmahal', 'Patan',
      'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar',
      'Tapi', 'Vadodara', 'Valsad'
    ]
  },
  {
    id: 'haryana',
    name: 'Haryana',
    type: 'State',
    districts: [
      'Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad',
      'Gurugram', 'Hisar', 'Jhajjar', 'Jind', 'Kaithal',
      'Karnal', 'Kurukshetra', 'Mahendragarh', 'Nuh', 'Palwal',
      'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa',
      'Sonipat', 'Yamunanagar'
    ]
  },
  {
    id: 'himachal-pradesh',
    name: 'Himachal Pradesh',
    type: 'State',
    districts: [
      'Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kinnaur',
      'Kullu', 'Lahaul and Spiti', 'Mandi', 'Shimla', 'Sirmaur',
      'Solan', 'Una'
    ]
  },
  {
    id: 'jharkhand',
    name: 'Jharkhand',
    type: 'State',
    districts: [
      'Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka',
      'East Singhbhum', 'Garhwa', 'Giridih', 'Godda', 'Gumla',
      'Hazaribagh', 'Jamtara', 'Khunti', 'Koderma', 'Latehar',
      'Lohardaga', 'Pakur', 'Palamu', 'Ramgarh', 'Ranchi',
      'Sahebganj', 'Seraikela Kharsawan', 'Simdega', 'West Singhbhum'
    ]
  },
  {
    id: 'karnataka',
    name: 'Karnataka',
    type: 'State',
    districts: [
      'Bagalkote', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban',
      'Bidar', 'Chamarajanagara', 'Chikkaballapura', 'Chikkamagaluru', 'Chitradurga',
      'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan',
      'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal',
      'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga',
      'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayanagara', 'Vijayapura', 'Yadgir'
    ]
  },
  {
    id: 'kerala',
    name: 'Kerala',
    type: 'State',
    districts: [
      'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod',
      'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad',
      'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
    ]
  },
  {
    id: 'madhya-pradesh',
    name: 'Madhya Pradesh',
    type: 'State',
    districts: [
      'Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat',
      'Barwani', 'Betul', 'Bhind', 'Bhopal', 'Burhanpur',
      'Chhatarpur', 'Chhindwara', 'Damoh', 'Datia', 'Dewas',
      'Dhar', 'Dindori', 'Guna', 'Gwalior', 'Harda',
      'Hoshangabad (Narmadapuram)', 'Indore', 'Jabalpur', 'Jhabua', 'Katni',
      'Khandwa', 'Khargone', 'Mandla', 'Mandsaur', 'Morena',
      'Narsinghpur', 'Neemuch', 'Niwari', 'Panna', 'Raisen',
      'Rajgarh', 'Ratlam', 'Rewa', 'Sagar', 'Satna',
      'Sehore', 'Seoni', 'Shahdol', 'Shajapur', 'Sheopur',
      'Shivpuri', 'Sidhi', 'Singrauli', 'Tikamgarh', 'Ujjain',
      'Umaria', 'Vidisha'
    ]
  },
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    type: 'State',
    districts: [
      'Ahmednagar', 'Akola', 'Amravati', 'Chhatrapati Sambhajinagar', 'Beed',
      'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli',
      'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur',
      'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded',
      'Nandurbar', 'Nashik', 'Dharashiv', 'Palghar', 'Parbhani',
      'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara',
      'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'
    ]
  },
  {
    id: 'manipur',
    name: 'Manipur',
    type: 'State',
    districts: [
      'Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West',
      'Jiribam', 'Kakching', 'Kamjong', 'Kangpokpi', 'Noney',
      'Pherzawl', 'Senapati', 'Tamenglong', 'Tengnoupal', 'Thoubal', 'Ukhrul'
    ]
  },
  {
    id: 'meghalaya',
    name: 'Meghalaya',
    type: 'State',
    districts: [
      'East Garo Hills', 'East Jaintia Hills', 'East Khasi Hills',
      'Eastern West Khasi Hills', 'North Garo Hills', 'Ri-Bhoi',
      'South Garo Hills', 'South West Garo Hills', 'South West Khasi Hills',
      'West Garo Hills', 'West Jaintia Hills', 'West Khasi Hills'
    ]
  },
  {
    id: 'mizoram',
    name: 'Mizoram',
    type: 'State',
    districts: [
      'Aizawl', 'Champhai', 'Hnahthial', 'Khawzawl', 'Kolasib',
      'Lawngtlai', 'Lunglei', 'Mamit', 'Saitual', 'Serchhip', 'Siaha'
    ]
  },
  {
    id: 'nagaland',
    name: 'Nagaland',
    type: 'State',
    districts: [
      'Chümoukedima', 'Dimapur', 'Kiphire', 'Kohima', 'Longleng',
      'Mokokchung', 'Mon', 'Niuland', 'Noklak', 'Peren',
      'Phek', 'Shamator', 'Tseminyü', 'Tuensang', 'Wokha', 'Zünheboto'
    ]
  },
  {
    id: 'odisha',
    name: 'Odisha',
    type: 'State',
    districts: [
      'Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak',
      'Boudh', 'Cuttack', 'Deogarh', 'Dhenkanal', 'Gajapati',
      'Ganjam', 'Jagatsinghpur', 'Jajpur', 'Jharsuguda', 'Kalahandi',
      'Kandhamal', 'Kendrapara', 'Kendujhar', 'Khordha', 'Koraput',
      'Malkangiri', 'Mayurbhanj', 'Nabarangpur', 'Nayagarh', 'Nuapada',
      'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur', 'Sundargarh'
    ]
  },
  {
    id: 'punjab',
    name: 'Punjab',
    type: 'State',
    districts: [
      'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib',
      'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar',
      'Kapurthala', 'Ludhiana', 'Malerkotla', 'Mansa', 'Moga',
      'Muktsar', 'Pathankot', 'Patiala', 'Rupnagar', 'Sahibzada Ajit Singh Nagar (Mohali)',
      'Shaheed Bhagat Singh Nagar', 'Sangrur', 'Tarn Taran'
    ]
  },
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    type: 'State',
    districts: [
      'Ajmer', 'Alwar', 'Banswara', 'Baran', 'Barmer',
      'Bharatpur', 'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh',
      'Churu', 'Dausa', 'Dholpur', 'Dungarpur', 'Hanumangarh',
      'Jaipur', 'Jaisalmer', 'Jalore', 'Jhalawar', 'Jhunjhunu',
      'Jodhpur', 'Karauli', 'Kota', 'Nagaur', 'Pali',
      'Pratapgarh', 'Rajsamand', 'Sawai Madhopur', 'Sikar', 'Sirohi',
      'Sri Ganganagar', 'Tonk', 'Udaipur'
    ]
  },
  {
    id: 'sikkim',
    name: 'Sikkim',
    type: 'State',
    districts: [
      'Gangtok', 'Gyalshing', 'Mangan', 'Namchi', 'Pakyong', 'Soreng'
    ]
  },
  {
    id: 'tamil-nadu',
    name: 'Tamil Nadu',
    type: 'State',
    districts: [
      'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
      'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
      'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
      'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
      'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
      'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
      'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
      'Vellore', 'Viluppuram', 'Virudhunagar'
    ]
  },
  {
    id: 'telangana',
    name: 'Telangana',
    type: 'State',
    districts: [
      'Adilabad', 'Bhadradri Kothagudem', 'Hanamkonda', 'Hyderabad', 'Jagtial',
      'Jangaon', 'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar',
      'Khammam', 'Komaram Bheem Asifabad', 'Mahabubabad', 'Mahabubnagar', 'Mancherial',
      'Medak', 'Medchal-Malkajgiri', 'Mulugu', 'Nagarkurnool', 'Nalgonda',
      'Narayanpet', 'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla',
      'Rangareddy', 'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad',
      'Wanaparthy', 'Warangal', 'Yadadri Bhuvanagiri'
    ]
  },
  {
    id: 'tripura',
    name: 'Tripura',
    type: 'State',
    districts: [
      'Dhalai', 'Gomati', 'Khowai', 'North Tripura', 'Sepahijala',
      'South Tripura', 'Unakoti', 'West Tripura'
    ]
  },
  {
    id: 'uttar-pradesh',
    name: 'Uttar Pradesh',
    type: 'State',
    districts: [
      'Agra', 'Aligarh', 'Ambedkar Nagar', 'Amethi', 'Amroha',
      'Auraiya', 'Ayodhya', 'Azamgarh', 'Baghpat', 'Bahraich',
      'Ballia', 'Balrampur', 'Banda', 'Barabanki', 'Bareilly',
      'Basti', 'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr',
      'Chandauli', 'Chitrakoot', 'Deoria', 'Etah', 'Etawah',
      'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Buddha Nagar (Noida)', 'Ghaziabad',
      'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hapur',
      'Hardoi', 'Hathras', 'Jalaun', 'Jaunpur', 'Jhansi',
      'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj', 'Kaushambi',
      'Kheri', 'Kushinagar', 'Lalitpur', 'Lucknow', 'Maharajganj',
      'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut',
      'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Pratapgarh',
      'Prayagraj', 'Raebareli', 'Rampur', 'Saharanpur', 'Sambhal',
      'Sant Kabir Nagar', 'Shahjahanpur', 'Shamli', 'Shravasti', 'Siddharthnagar',
      'Sitapur', 'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi'
    ]
  },
  {
    id: 'uttarakhand',
    name: 'Uttarakhand',
    type: 'State',
    districts: [
      'Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun',
      'Haridwar', 'Nainital', 'Pauri Garhwal', 'Pithoragarh', 'Rudraprayag',
      'Tehri Garhwal', 'Udham Singh Nagar', 'Uttarkashi'
    ]
  },
  {
    id: 'west-bengal',
    name: 'West Bengal',
    type: 'State',
    districts: [
      'Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur',
      'Darjeeling', 'Hooghly', 'Howrah', 'Jalpaiguri', 'Jhargram',
      'Kalimpong', 'Kolkata', 'Malda', 'Murshidabad', 'Nadia',
      'North 24 Parganas', 'Paschim Bardhaman', 'Paschim Medinipur', 'Purba Bardhaman',
      'Purba Medinipur', 'Purulia', 'South 24 Parganas', 'Uttar Dinajpur'
    ]
  }
];

export const UNION_TERRITORIES = [
  {
    id: 'andaman-nicobar',
    name: 'Andaman and Nicobar Islands',
    type: 'Union Territory',
    districts: ['Nicobar', 'North and Middle Andaman', 'South Andaman']
  },
  {
    id: 'chandigarh',
    name: 'Chandigarh',
    type: 'Union Territory',
    districts: ['Chandigarh']
  },
  {
    id: 'dadra-nagar-haveli-daman-diu',
    name: 'Dadra and Nagar Haveli and Daman and Diu',
    type: 'Union Territory',
    districts: ['Daman', 'Diu', 'Dadra and Nagar Haveli']
  },
  {
    id: 'delhi',
    name: 'Delhi',
    type: 'Union Territory',
    districts: [
      'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi',
      'North East Delhi', 'North West Delhi', 'Shahdara', 'South Delhi',
      'South East Delhi', 'South West Delhi', 'West Delhi'
    ]
  },
  {
    id: 'jammu-kashmir',
    name: 'Jammu and Kashmir',
    type: 'Union Territory',
    districts: [
      'Anantnag', 'Bandipora', 'Baramulla', 'Budgam', 'Doda',
      'Ganderbal', 'Jammu', 'Kathua', 'Kishtwar', 'Kulgam',
      'Kupwara', 'Poonch', 'Pulwama', 'Rajouri', 'Ramban',
      'Reasi', 'Samba', 'Shopian', 'Srinagar', 'Udhampur'
    ]
  },
  {
    id: 'ladakh',
    name: 'Ladakh',
    type: 'Union Territory',
    districts: ['Kargil', 'Leh']
  },
  {
    id: 'lakshadweep',
    name: 'Lakshadweep',
    type: 'Union Territory',
    districts: ['Lakshadweep']
  },
  {
    id: 'puducherry',
    name: 'Puducherry',
    type: 'Union Territory',
    districts: ['Karaikal', 'Mahe', 'Puducherry', 'Yanam']
  }
];

/**
 * All 36 Indian administrative divisions (28 States + 8 UTs)
 */
export const ALL_INDIAN_REGIONS = [...INDIAN_STATES, ...UNION_TERRITORIES].sort((a, b) =>
  a.name.localeCompare(b.name)
);

/**
 * Map of region names to district arrays for O(1) cascading lookup
 */
export const REGION_DISTRICT_MAP = ALL_INDIAN_REGIONS.reduce((acc, region) => {
  acc[region.name] = region.districts;
  acc[region.id] = region.districts;
  return acc;
}, {});

/**
 * Get districts for a given state or UT (by name or ID)
 */
export function getDistrictsForRegion(regionIdentifier) {
  if (!regionIdentifier) return [];
  if (REGION_DISTRICT_MAP[regionIdentifier]) {
    return REGION_DISTRICT_MAP[regionIdentifier];
  }
  const clean = String(regionIdentifier).trim().toLowerCase();
  const matched = ALL_INDIAN_REGIONS.find(
    (r) => r.name.toLowerCase() === clean || r.id.toLowerCase() === clean
  );
  return matched ? matched.districts : [];
}

/**
 * All official Indic languages supported in the platform
 */
export const SUPPORTED_INDIC_LANGUAGES = [
  { code: 'te', name: 'Telugu', native_name: 'తెలుగు', is_indic: true },
  { code: 'hi', name: 'Hindi', native_name: 'हिन्दी', is_indic: true },
  { code: 'en', name: 'English', native_name: 'English', is_indic: false },
  { code: 'ta', name: 'Tamil', native_name: 'தமிழ்', is_indic: true },
  { code: 'kn', name: 'Kannada', native_name: 'ಕನ್ನಡ', is_indic: true },
  { code: 'ml', name: 'Malayalam', native_name: 'മലയാളം', is_indic: true },
  { code: 'mr', name: 'Marathi', native_name: 'मराठी', is_indic: true },
  { code: 'bn', name: 'Bengali', native_name: 'বাংলা', is_indic: true },
  { code: 'gu', name: 'Gujarati', native_name: 'ગુજરાતી', is_indic: true },
  { code: 'pa', name: 'Punjabi', native_name: 'ਪੰਜਾਬੀ', is_indic: true },
  { code: 'or', name: 'Odia', native_name: 'ଓଡ଼ିଆ', is_indic: true },
  { code: 'ur', name: 'Urdu', native_name: 'اردو', is_indic: true }
];
