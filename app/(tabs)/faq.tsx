import { StatusBar } from 'expo-status-bar';
import { Quote, ChevronDown } from '@tamagui/lucide-icons';
import { Accordion, Paragraph, Square, YStack } from 'tamagui';

const accordionData = [
  {
    id: 'a1',
    title: 'Difference between STANDBY and SLEEP?',
    content:
      'Sleep turns off both the rotor and the laser emitters of a base station version 2.0.\n\nStandby turns off only the lasers and keeps the rotor spinning, which allows a faster wake up at the cost of a faint background noise.',
  },
  {
    id: 'a2',
    title: 'What to do if my Lighthouse is not detected?',
    content:
      'If your Lighthouse is not detected by your phone, it can usually be fixed by power cycling the unit. Unplug the base station, wait for it to shut down completely, then plug it back in. It should become visible again once it restarts.',
  },
];

export default function FAQScreen() {
  return (
    <YStack flex={1} items='center' gap='$8' px='$2' pt='$5'>
      <Accordion overflow='hidden' width='100%' type='multiple'>
        {accordionData.map((item) => (
          <Accordion.Item key={item.id} value={item.id}>
            <Accordion.Trigger
              flexDirection='row'
              bg='$background08'
              borderWidth={1}
              borderColor='$borderColor'
            >
              {({ open }: { open: boolean }) => (
                <>
                  <YStack flexDirection='row' flex={1} gap='$3'>
                    <Quote size={16} color='$color' opacity={0.6} />
                    <Paragraph
                      color='$color'
                      fontSize='$4'
                      flex={1}
                      fontWeight='600'
                    >
                      {item.title}
                    </Paragraph>
                  </YStack>
                  <Square animation='quick' rotate={open ? '180deg' : '0deg'}>
                    <ChevronDown size='$1' />
                  </Square>
                </>
              )}
            </Accordion.Trigger>

            <Accordion.HeightAnimator animation='medium'>
              <Accordion.Content
                animation='medium'
                exitStyle={{ opacity: 0 }}
                borderWidth={1}
                borderColor='$borderColor'
                borderTopWidth={0}
                borderBottomLeftRadius='$4'
                borderBottomRightRadius='$4'
              >
                <Paragraph
                  color='$color'
                  opacity={0.8}
                  fontSize='$3'
                  lineHeight='$5'
                >
                  {item.content}
                </Paragraph>
              </Accordion.Content>
            </Accordion.HeightAnimator>
          </Accordion.Item>
        ))}
      </Accordion>
      <StatusBar style='auto' />
    </YStack>
  );
}
