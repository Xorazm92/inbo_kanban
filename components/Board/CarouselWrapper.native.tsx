import React from 'react';
import Carousel, { Pagination } from 'react-native-reanimated-carousel';

interface CarouselWrapperProps {
  data: any[];
  width: number;
  height: number;
  renderItem: (props: any) => React.ReactElement;
  onProgressChange?: (value: any) => void;
  progress: any;
}

const CarouselWrapper = React.forwardRef<any, CarouselWrapperProps>(
  ({ data, width, height, renderItem, onProgressChange, progress }, ref) => {
    return (
      <>
        <Carousel
          width={width}
          height={height}
          loop={false}
          ref={ref}
          onProgressChange={onProgressChange}
          data={data}
          pagingEnabled={true}
          renderItem={renderItem}
        />
        <Pagination.Basic
          progress={progress}
          data={data}
          dotStyle={{ backgroundColor: '#ffffff5c', borderRadius: 40 }}
          size={8}
          activeDotStyle={{ backgroundColor: '#fff' }}
          containerStyle={{ gap: 10, marginTop: 10 }}
        />
      </>
    );
  }
);

export default CarouselWrapper;
