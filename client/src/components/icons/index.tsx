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
  MdOutlineBackspace,
} from 'react-icons/md';

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
export const Backspace = (props: IconBaseProps) => <MdOutlineBackspace {...props} />;
/**KIOSK realted icons ends here */
