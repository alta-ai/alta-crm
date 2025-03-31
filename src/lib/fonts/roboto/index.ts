import { Font } from '@react-pdf/renderer';

// Import Roboto font files
import RobotoRegular from './Roboto-Regular.ttf';
import RobotoMedium from './Roboto-Medium.ttf';
import RobotoBold from './Roboto-Bold.ttf';
import RobotoItalic from './Roboto-Italic.ttf';

// Register Roboto font family
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: RobotoRegular,
      fontWeight: 400,
    },
    {
      src: RobotoMedium,
      fontWeight: 500,
    },
    {
      src: RobotoBold,
      fontWeight: 700,
    },
    {
      src: RobotoItalic,
      fontStyle: 'italic',
      fontWeight: 400,
    }
  ]
});

// Export to ensure the registration runs
export const fontFamily = 'Roboto';