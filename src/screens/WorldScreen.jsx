import React, {useState, useEffect, useRef} from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  ImageBackground,
  Dimensions,
  Text,
} from 'react-native';
import {
  GestureHandlerRootView,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';

import {fetchAllWorlds, fetchAllWorldCells} from '../api';
import SquareHex from '../assets/icons/SquareHex';
import {Assets} from '../assets/images';
import Colors from '../constants/Colors';
import {fetchFromCache} from '../helpers/cache';

const MILLISECONDS_IN_DAY = 86400000;

export default function WorldScreen() {
  const deviceDimensions = useRef({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  });

  const imageDimensions = useRef({
    x: deviceDimensions.current.height * 1.3,
    y: deviceDimensions.current.height,
    hexSize: deviceDimensions.current.height / 100,
  });

  const [pageState, setPageState] = useState({
    mapHex: null,
    mapHexStartPoints: null,
    worlds: [],
    world: null,
    cells: [],
    cell: null,
  });

  useEffect(() => {
    const fetchWorlds = async () =>
      await fetchFromCache(false, 'worlds', MILLISECONDS_IN_DAY, () =>
        fetchAllWorlds(),
      );

    Promise.all([fetchWorlds()]).then(([worldsData]) => {
      setPageState({
        ...pageState,
        worlds: worldsData,
        world: worldsData[0],
      });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const fetchWorldCells = async () =>
      await fetchFromCache(
        false,
        `world_cells_${pageState.world.id}`,
        MILLISECONDS_IN_DAY,
        () => fetchAllWorldCells(pageState.world.id),
      );

    if (!pageState.world) {
      return;
    }

    Promise.all([fetchWorldCells()]).then(([cellsData]) => {
      setPageState({
        ...pageState,
        cells: cellsData,
      });
    });
  }, [pageState.world]); // eslint-disable-line react-hooks/exhaustive-deps

  const scale = useSharedValue(1);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  const savedScale = useSharedValue(1);
  const savedOffsetX = useSharedValue(0);
  const savedOffsetY = useSharedValue(0);

  const allowedLeftTranslation = useSharedValue(0);
  const allowedRightTranslation = useSharedValue(0);
  const allowedTopTranslation = useSharedValue(0);
  const allowedBottomTranslation = useSharedValue(0);

  const dragGesture = Gesture.Pan()
    .onStart(event => {
      const screenX = Math.floor(deviceDimensions.current.width / scale.value);
      const visibleLeftPercent =
        event.absoluteX / deviceDimensions.current.width;
      const visibleLeft = visibleLeftPercent * screenX;

      allowedLeftTranslation.value = event.x - visibleLeft;
      allowedRightTranslation.value = -(
        imageDimensions.current.x -
        allowedLeftTranslation.value -
        screenX
      );

      const screenY = Math.floor(deviceDimensions.current.height / scale.value);
      const visibleTopPercent =
        event.absoluteY / deviceDimensions.current.height;
      const visibleTop = visibleTopPercent * screenY;

      allowedTopTranslation.value = event.y - visibleTop;
      allowedBottomTranslation.value = -(
        deviceDimensions.current.height -
        allowedTopTranslation.value -
        screenY
      );
    })
    .onChange(event => {
      // translationX > 0 == map left, cursor moving right
      // translationX < 0 == map right, cursor moving left
      // translationY > 0 == map top, cursor moving bottom
      // translationY < 0 == map bottom, cursor moving top
      if (
        (event.translationX > 0 &&
          event.translationX <= allowedLeftTranslation.value) ||
        (event.translationX < 0 &&
          event.translationX >= allowedRightTranslation.value)
      ) {
        offsetX.value = savedOffsetX.value + event.translationX;
      }
      if (
        (event.translationY > 0 &&
          event.translationY <= allowedTopTranslation.value) ||
        (event.translationY < 0 &&
          event.translationY >= allowedBottomTranslation.value)
      ) {
        offsetY.value = savedOffsetY.value + event.translationY;
      }
    })
    .onFinalize(() => {
      savedOffsetX.value = offsetX.value;
      savedOffsetY.value = offsetY.value;
    });

  const zoomGesture = Gesture.Pinch()
    .onUpdate(event => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const singleTapGesture = Gesture.Tap()
    .maxDuration(250)
    .onStart(event => {
      const q = Math.floor(event.x / imageDimensions.current.hexSize);
      const r = Math.floor(event.y / imageDimensions.current.hexSize);
      const cell = pageState.cells.find(item => item.q === q && item.r === r);

      runOnJS(setPageState)({
        ...pageState,
        mapHex: {
          r: r,
          q: q,
        },
        mapHexStartPoints: {
          x: q * imageDimensions.current.hexSize,
          y: r * imageDimensions.current.hexSize,
        },
        cell: cell,
      });
    });

  const zoomInGesture = Gesture.Manual().onTouchesDown(event => {
    scale.value = savedScale.value + 0.5;
    savedScale.value = scale.value;
  });

  const zoomOutGesture = Gesture.Manual().onTouchesDown(event => {
    if (savedScale.value >= 1.5) {
      scale.value = savedScale.value - 0.5;
    } else {
      scale.value = 1;
    }
    savedScale.value = scale.value;
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {scale: scale.value},
      {translateX: offsetX.value},
      {translateY: offsetY.value},
    ],
  }));

  const composedGesture = Gesture.Race(
    dragGesture,
    zoomGesture,
    singleTapGesture,
  );

  console.log(pageState);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={{backgroundColor: Colors.black, position: 'relative'}}>
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[styles.mapBox, animatedStyle]}>
            <ImageBackground
              source={Assets.worldMap}
              resizeMode="contain"
              style={{flex: 1, justifyContent: 'center'}}
            />
            {pageState.mapHexStartPoints ? (
              <SquareHex
                size={imageDimensions.current.hexSize}
                styles={{
                  position: 'absolute',
                  left: pageState.mapHexStartPoints.x,
                  top: pageState.mapHexStartPoints.y,
                }}
              />
            ) : null}
          </Animated.View>
        </GestureDetector>
        <GestureDetector gesture={zoomInGesture}>
          <View style={[styles.zoomButtonBox, {right: 58}]}>
            <Text style={styles.zoomButton}>+</Text>
          </View>
        </GestureDetector>
        <GestureDetector gesture={zoomOutGesture}>
          <View style={[styles.zoomButtonBox, {right: 24}]}>
            <Text style={styles.zoomButton}>-</Text>
          </View>
        </GestureDetector>
        {pageState.mapHex ? (
          <View style={styles.cellBox}>
            <Text style={styles.cellName}>
              {pageState.cell ? pageState.cell.name : 'Terra incognita'}
            </Text>
            <View style={styles.worldStatisticsBox}>
              <Text style={styles.worldStatisticsText}>
                {pageState.cell ? pageState.cell.surface : 'Land'}
              </Text>
              <Text style={styles.worldStatisticsText}>
                {pageState.mapHex.q}x{pageState.mapHex.r}
              </Text>
              <Text style={styles.worldStatisticsText} />
            </View>
          </View>
        ) : null}
        {pageState.world ? (
          <View style={styles.worldBox}>
            <Text style={styles.worldName}>{pageState.world.name}</Text>
            <View style={styles.worldStatisticsBox}>
              <Text style={styles.worldStatisticsText}>
                Size {pageState.world.map_size.q + 1}x
                {pageState.world.map_size.r + 1}
              </Text>
              <Text style={styles.worldStatisticsText}>
                Age {pageState.world.ticks}
              </Text>
              <Text style={styles.worldStatisticsText}>Bottles 0</Text>
            </View>
          </View>
        ) : null}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  mapBox: {
    position: 'relative',
    width: Dimensions.get('window').height * 1.3,
    height: Dimensions.get('window').height,
  },
  zoomButtonBox: {
    position: 'absolute',
    top: 56,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.stone400,
    borderRadius: 4,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomButton: {
    fontSize: 18,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  cellBox: {
    position: 'absolute',
    bottom: 120,
    left: '5%',
    width: '90%',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.stone400,
    borderRadius: 8,
    padding: 8,
  },
  cellName: {
    marginBottom: 8,
    fontSize: 20,
  },
  worldBox: {
    position: 'absolute',
    bottom: 50,
    left: '5%',
    width: '90%',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.stone400,
    borderRadius: 8,
    padding: 8,
  },
  worldName: {
    marginBottom: 8,
    fontSize: 20,
  },
  worldStatisticsBox: {
    flexDirection: 'row',
  },
  worldStatisticsText: {
    flex: 1,
    fontSize: 12,
  },
});
