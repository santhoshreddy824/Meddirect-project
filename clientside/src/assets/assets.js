import appointment_img from './appointment_img.png';
import header_img from './header_img.png';
import group_profiles from './group_profiles.png';
import profile_pic from './profile_pic.png';
import contact_image from './contact_image.png';
import about_image from './about_image.png';
import logo from './logo_final.svg';
import dropdown_icon from './dropdown_icon.svg';
import menu_icon from './menu_icon.svg';
import cross_icon from './cross_icon.png';
import chats_icon from './chats_icon.svg';
import verified_icon from './verified_icon.svg';
import arrow_icon from './arrow_icon.svg';
import info_icon from './info_icon.svg';
import upload_icon from './upload_icon.png';
import doc1 from './doc1.png';
import doc2 from './doc2.png';
import doc3 from './doc3.png';
import doc4 from './doc4.png';
import doc5 from './doc5.png';
import doc6 from './doc6.png';
import doc7 from './doc7.png';
import doc8 from './doc8.png';
import doc9 from './doc9.png';
import doc10 from './doc10.png';
import doc11 from './doc11.png';
import doc12 from './doc12.png';
import doc13 from './doc13.png';
import doc14 from './doc14.png';
import doc15 from './doc15.png';
import Dermatologist from './Dermatologist.svg';
import Gastroenterologist from './Gastroenterologist.svg';
import General_physician from './General_physician.svg';
import Gynecologist from './Gynecologist.svg';
import Neurologist from './Neurologist.svg';
import Pediatricians from './Pediatricians.svg';

export const assets = {
  appointment_img,
  header_img,
  group_profiles,
  profile_pic,
  contact_image,
  about_image,
  logo,
  dropdown_icon,
  menu_icon,
  cross_icon,
  chats_icon,
  verified_icon,
  arrow_icon,
  info_icon,
  upload_icon,
  doc1,
  doc2,
  doc3,
  doc4,
  doc5,
  doc6,
  doc7,
  doc8,
  doc9,
  doc10,
  doc11,
  doc12,
  doc13,
  doc14,
  doc15,
  Dermatologist,
  Gastroenterologist,
  General_physician,
  Gynecologist,
  Neurologist,
  Pediatricians
};

export const specialityData = [
  {
    speciality: 'General physician',
    image: General_physician
  },
  {
    speciality: 'Gynecologist', 
    image: Gynecologist
  },
  {
    speciality: 'Dermatologist',
    image: Dermatologist
  },
  {
    speciality: 'Pediatricians',
    image: Pediatricians
  },
  {
    speciality: 'Neurologist',
    image: Neurologist
  },
  {
    speciality: 'Gastroenterologist',
    image: Gastroenterologist
  }
];

export const doctors = [
  {
    _id: 'doc1',
    name: 'Dr. Richard James',
    image: doc1,
    speciality: 'General physician',
    degree: 'MBBS',
    experience: '4 Years',
    about: 'Dr. Richard has extensive experience in general medicine and patient care.',
    fees: 650,
    address: { line1: '17th Cross, Richmond', line2: 'Circle, Ring Road, London' }
  },
  {
    _id: 'doc2',
    name: 'Dr. Emily Larson',
    image: doc2,
    speciality: 'Gynecologist',
    degree: 'MBBS',
    experience: '3 Years',
    about: 'Dr. Emily specializes in women\'s health and reproductive medicine.',
    fees: 700,
    address: { line1: '27th Cross, Richmond', line2: 'Circle, Ring Road, London' }
  },
  {
    _id: 'doc3',
    name: 'Dr. Sarah Patel',
    image: doc3,
    speciality: 'Dermatologist',
    degree: 'MBBS',
    experience: '2 Years',
    about: 'Dr. Sarah is skilled in dermatology and skin care treatments.',
    fees: 600,
    address: { line1: '37th Cross, Richmond', line2: 'Circle, Ring Road, London' }
  },
  {
    _id: 'doc4',
    name: 'Dr. Michael Brown',
    image: doc4,
    speciality: 'Pediatricians',
    degree: 'MBBS',
    experience: '5 Years',
    about: 'Dr. Michael specializes in pediatric care and child health.',
    fees: 750,
    address: { line1: '47th Cross, Richmond', line2: 'Circle, Ring Road, London' }
  },
  {
    _id: 'doc5',
    name: 'Dr. Jennifer Wilson',
    image: doc5,
    speciality: 'Neurologist',
    degree: 'MBBS',
    experience: '6 Years',
    about: 'Dr. Jennifer is experienced in neurological disorders and brain health.',
    fees: 800,
    address: { line1: '57th Cross, Richmond', line2: 'Circle, Ring Road, London' }
  },
  {
    _id: 'doc6',
    name: 'Dr. David Chen',
    image: doc6,
    speciality: 'Gastroenterologist',
    degree: 'MBBS, MD',
    experience: '7 Years',
    about: 'Dr. David specializes in digestive system disorders and treatments.',
    fees: 850,
    address: { line1: '67th Cross, Richmond', line2: 'Circle, Ring Road, London' }
  },
  {
    _id: 'doc7',
    name: 'Dr. Lisa Thompson',
    image: doc7,
    speciality: 'Dermatologist',
    degree: 'MBBS, MD',
    experience: '4 Years',
    about: 'Dr. Lisa provides comprehensive dermatological care and cosmetic treatments.',
    fees: 720,
    address: { line1: '77th Cross, Richmond', line2: 'Circle, Ring Road, London' }
  },
  {
    _id: 'doc8',
    name: 'Dr. Robert Kumar',
    image: doc8,
    speciality: 'General physician',
    degree: 'MBBS',
    experience: '8 Years',
    about: 'Dr. Robert has extensive experience in family medicine and preventive care.',
    fees: 680,
    address: { line1: '87th Cross, Richmond', line2: 'Circle, Ring Road, London' }
  },
  {
    _id: 'doc9',
    name: 'Dr. Maria Garcia',
    image: doc9,
    speciality: 'Gynecologist',
    degree: 'MBBS, MS',
    experience: '6 Years',
    about: 'Dr. Maria specializes in women\'s health, pregnancy care, and gynecological surgeries.',
    fees: 780,
    address: { line1: '97th Cross, Richmond', line2: 'Circle, Ring Road, London' }
  },
  {
    _id: 'doc10',
    name: 'Dr. James Lee',
    image: doc10,
    speciality: 'Pediatricians',
    degree: 'MBBS, MD',
    experience: '5 Years',
    about: 'Dr. James provides comprehensive pediatric care from newborns to adolescents.',
    fees: 760,
    address: { line1: '107th Cross, Richmond', line2: 'Circle, Ring Road, London' }
  },
  {
    _id: 'doc11',
    name: 'Dr. Amanda White',
    image: doc11,
    speciality: 'Neurologist',
    degree: 'MBBS, DM',
    experience: '9 Years',
    about: 'Dr. Amanda specializes in stroke care, epilepsy, and movement disorders.',
    fees: 900,
    address: { line1: '117th Cross, Richmond', line2: 'Circle, Ring Road, London' }
  },
  {
    _id: 'doc12',
    name: 'Dr. Kevin O\'Connor',
    image: doc12,
    speciality: 'Gastroenterologist',
    degree: 'MBBS, MD',
    experience: '6 Years',
    about: 'Dr. Kevin treats liver diseases, inflammatory bowel disease, and performs endoscopy procedures.',
    fees: 820,
    address: { line1: '127th Cross, Richmond', line2: 'Circle, Ring Road, London' }
  },
  {
    _id: 'doc13',
    name: 'Dr. Rachel Green',
    image: doc13,
    speciality: 'Dermatologist',
    degree: 'MBBS, DVD',
    experience: '5 Years',
    about: 'Dr. Rachel specializes in acne treatment, psoriasis, and dermatological surgery.',
    fees: 740,
    address: { line1: '137th Cross, Richmond', line2: 'Circle, Ring Road, London' }
  },
  {
    _id: 'doc14',
    name: 'Dr. Thomas Anderson',
    image: doc14,
    speciality: 'General physician',
    degree: 'MBBS, MD',
    experience: '10 Years',
    about: 'Dr. Thomas has a decade of experience in internal medicine and chronic disease management.',
    fees: 700,
    address: { line1: '147th Cross, Richmond', line2: 'Circle, Ring Road, London' }
  },
  {
    _id: 'doc15',
    name: 'Dr. Sophie Martin',
    image: doc15,
    speciality: 'Pediatricians',
    degree: 'MBBS, DCH',
    experience: '7 Years',
    about: 'Dr. Sophie provides expert pediatric care including vaccinations and developmental assessments.',
    fees: 790,
    address: { line1: '157th Cross, Richmond', line2: 'Circle, Ring Road, London' }
  }
];