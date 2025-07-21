import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  return (
    <View style={styles.container}>
      
      {/* White Tab Bar Container */}
      <View style={styles.whiteContainer}>
        <View style={styles.tabBarContainer}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const icon = options.tabBarIcon ? options.tabBarIcon({
              focused: isFocused,
              color: isFocused ? '#2B9CFF' : '#AAAAAA',
              size: 24
            }) : null;

            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                style={styles.tabButton}
                onPress={onPress}
              >
                {icon}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: 60,
    backgroundColor: 'transparent',
    paddingBottom: 8,
    paddingHorizontal: 0,
  },
  whiteContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    width: '92%',
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 8,
    // Shadow for the white tab bar
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    borderRadius: 24,
    marginHorizontal: 2,
  },
});

export default CustomTabBar;
