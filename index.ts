// Order matters: Unistyles must be configured before expo-router loads any route.
import './src/theme/unistyles';
import './src/core/i18n';
import 'expo-router/entry';
