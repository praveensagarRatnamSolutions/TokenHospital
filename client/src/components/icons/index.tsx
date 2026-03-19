import { IconBaseProps } from 'react-icons';

import {
  MdKeyboardDoubleArrowUp,
  MdOutlineMedicalServices,
  MdOutlinePerson,
  MdCalendarToday,
  MdOutlineMonitorWeight,
  MdOutlineLocalPhone,
  MdHelpOutline,
  MdOutlineCheckCircle,
  MdOutlineArrowBack,
  MdOutlineArrowForward,
  MdOutlineBackspace,
  MdSearch,
  MdHearing,
  MdOutlineVaccines,
  MdOutlineApartment,
  MdPayments,
  MdOutlineQrCode2,
  MdOutlineCreditCard,
  MdOutlinePrint,
  MdOutlineHealthAndSafety,
  MdAccessTime,
  MdOutlineLocalHospital,
  MdEvent,
  MdGroups,
} from 'react-icons/md';

import { LuStethoscope, LuBaby } from 'react-icons/lu';

import { IoMdHeartEmpty } from 'react-icons/io';
import { SiSpine } from 'react-icons/si';
/**Admin realted icons starts here */

/**Admin realted icons ends here */

/**Doctor realted icons starts here */

/**Doctor realted icons ends here */

/**KIOSK realted icons starts here */
export const DoubleArrowUp = (props: IconBaseProps) => (
  <MdKeyboardDoubleArrowUp {...props} />
);
export const MedicalServices = (props: IconBaseProps) => (
  <MdOutlineMedicalServices {...props} />
);
export const OutlinePerson = (props: IconBaseProps) => <MdOutlinePerson {...props} />;
export const Calendar = (props: IconBaseProps) => <MdCalendarToday {...props} />;
export const Monitor = (props: IconBaseProps) => <MdOutlineMonitorWeight {...props} />;
export const Phone = (props: IconBaseProps) => <MdOutlineLocalPhone {...props} />;
export const Help = (props: IconBaseProps) => <MdHelpOutline {...props} />;
export const Check = (props: IconBaseProps) => <MdOutlineCheckCircle {...props} />;
export const ArrowBack = (props: IconBaseProps) => <MdOutlineArrowBack {...props} />;
export const ArrowForward = (props: IconBaseProps) => (
  <MdOutlineArrowForward {...props} />
);
export const Backspace = (props: IconBaseProps) => <MdOutlineBackspace {...props} />;
export const Search = (props: IconBaseProps) => <MdSearch {...props} />;
export const Stethoscope = (props: IconBaseProps) => <LuStethoscope {...props} />;
export const Heart = (props: IconBaseProps) => <IoMdHeartEmpty {...props} />;
export const Spine = (props: IconBaseProps) => <SiSpine {...props} />;
export const Baby = (props: IconBaseProps) => <LuBaby {...props} />;
export const Hearing = (props: IconBaseProps) => <MdHearing {...props} />;
export const Vaccines = (props: IconBaseProps) => <MdOutlineVaccines {...props} />;
export const Apartment = (props: IconBaseProps) => <MdOutlineApartment {...props} />;
export const Payments = (props: IconBaseProps) => <MdPayments {...props} />;
export const QrCode = (props: IconBaseProps) => <MdOutlineQrCode2 {...props} />;
export const CreditCard = (props: IconBaseProps) => <MdOutlineCreditCard {...props} />;

export const HealthAndSafety = (props: IconBaseProps) => (
  <MdOutlineHealthAndSafety {...props} />
);
export const Print = (props: IconBaseProps) => <MdOutlinePrint {...props} />;
export const LocalHospital = (props: IconBaseProps) => (
  <MdOutlineLocalHospital {...props} />
);
export const AccessTime = (props: IconBaseProps) => <MdAccessTime {...props} />;
export const Event = (props: IconBaseProps) => <MdEvent {...props} />;
export const Groups = (props: IconBaseProps) => <MdGroups {...props} />;
/**KIOSK realted icons ends here */
