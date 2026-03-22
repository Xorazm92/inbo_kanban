import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';

interface CarouselWrapperProps {
  data: any[];
  width: number;
  height: number;
  renderItem: (props: any) => React.ReactElement;
  onProgressChange?: (value: any) => void;
  ref?: any;
  progress?: any;
}

const CarouselWrapper = React.forwardRef<any, CarouselWrapperProps>(
  ({ data, width, height, renderItem }, ref) => {
    return (
      <View style={{ flex: 1 }}>
        <FlatList
          ref={ref}
          data={data}
          horizontal
          pagingEnabled
          keyExtractor={(item, index) => item.id || `new-${index}`}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          snapToInterval={400} // Trello-like fixed width for web
          decelerationRate="fast"
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    );
  }
);

export default CarouselWrapper;
