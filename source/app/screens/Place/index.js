import React, { Component } from "react";
import {
  FlatList,  
  RefreshControl,
  View,
  Animated,
  Platform,
  TouchableOpacity
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { BaseStyle, BaseColor } from "@config";
import {
  Header,
  SafeAreaView,
  Icon,
  PlaceItem,
  FilterSort,
  CardList
} from "@components";
import styles from "./styles";
import * as Utils from "@utils";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { ResAction} from "@actions";
import api from "../../config/api";
import { toHumanSize } from "i18n-js";


class Place extends Component {
  constructor(props) {
    super(props);
    const scrollAnim = new Animated.Value(0);
    const offsetAnim = new Animated.Value(0);

    this.state = {
      refreshing: false,
      modeView: "list",
      mapView: false,     
      currentLocation: {
        latitude: null,
        longitude: null
      },

      scrollAnim,
      offsetAnim,
      clampedScroll: Animated.diffClamp(
        Animated.add(
          scrollAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
            extrapolateLeft: "clamp"
          }),
          offsetAnim
        ),
        0,
        40
      )
    };
    this.onChangeView = this.onChangeView.bind(this);
    this.onFilter = this.onFilter.bind(this);
    this.onChangeSort = this.onChangeSort.bind(this);


    // init reslists
    let credential = {      
      category_id: "6",      
    }

    this.props.actions.restaurants(credential, response => {            
      console.log("res success");      
      if ( response.success ) {
        this.setState(
          { 
            list: response.data.restaurants ,
            region: {
              latitude: parseFloat(response.data.restaurants[0].lat),
              longitude: parseFloat(response.data.restaurants[0].lng),
              latitudeDelta: 0.009,
              longitudeDelta: 0.004
            },
          }
        );        
        
      } else {
        this.setState({
          loading: false
        });
      }
    });

  }


  onChangeSort(selected) {    

    
    if(selected.value == 1){          
      console.log(this.state.list[0].id);
      const mylist = this.state.list.sort((a, b) => (a.id > b.id) ? -1 : 1)
      
      this.setState({
        list: mylist
      });

      //this.state.list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }else if(selected.value == 2){
      const mylist = this.state.list.sort((a, b) => (a.id > b.id) ? 1 : -1)
      //this.state.list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      this.setState({
        list: mylist
      });


    }else if(selected.value == 3){
      const mylist = this.state.list.sort((a, b) => (a.rate > b.rate) ? -1 : 1)      
      this.setState({
        list: mylist
      });

    }else{
      const mylist = this.state.list.sort((a, b) => (a.rate > b.rate) ? -1 : 1)   
      this.setState({
        list: mylist
      });
    }
  }

  /**
   * @description Open modal when filterring mode is applied
   * @author Passion UI <passionui.com>
   * @date 2019-09-01
   */
  onFilter() {
    const { navigation } = this.props;
    navigation.navigate("Filter");
  }

  /**
   * @description Open modal when view mode is pressed
   * @author Passion UI <passionui.com>
   * @date 2019-09-01
   */
  onChangeView() {
    let { modeView } = this.state;
    Utils.enableExperimental();
    switch (modeView) {
      case "block":
        this.setState({
          modeView: "grid"
        });
        break;
      case "grid":
        this.setState({
          modeView: "list"
        });
        break;
      case "list":
        this.setState({
          modeView: "block"
        });
        break;
      default:
        this.setState({
          modeView: "block"
        });
        break;
    }
  }

  onChangeMapView() {
    const { mapView } = this.state;
    Utils.enableExperimental();
    console.log("open map view");
    this.setState({
      mapView: !mapView
    });
  }

  onSelectLocation(location) {
    for (let index = 0; index < this.state.list.length; index++) {
      const element = this.state.list[index];
      if (
        element.lat == location.lat &&
        element.lng == location.lng
      ) {
        this.flatListRef.scrollToIndex({
          animated: true,
          index
        });
      }
    }
  }

  /**
   * @description Render container view
   * @author Passion UI <passionui.com>
   * @date 2019-09-01
   * @returns
   */
  renderList() {
    const { modeView, list, refreshing, clampedScroll } = this.state;
    const { navigation } = this.props;
    const navbarTranslate = clampedScroll.interpolate({
      inputRange: [0, 40],
      outputRange: [0, -40],
      extrapolate: "clamp"
    });
    const android = Platform.OS == "android";
    switch (modeView) {
      case "block":
        return (
          <View style={{ flex: 1 }}>
            <Animated.FlatList
              contentInset={{ top: 50 }}
              contentContainerStyle={{
                marginTop: android ? 50 : 0,
                margin:20
              }}
              refreshControl={
                <RefreshControl
                  colors={[BaseColor.primaryColor]}
                  tintColor={BaseColor.primaryColor}
                  refreshing={refreshing}
                  onRefresh={() => {}}
                />
              }
              scrollEventThrottle={1}
              onScroll={Animated.event(
                [
                  {
                    nativeEvent: {
                      contentOffset: {
                        y: this.state.scrollAnim
                      }
                    }
                  }
                ],
                { useNativeDriver: true }
              )}
              data={list}
              key={"block"}
              keyExtractor={(item, index) => item.id}
              renderItem={({ item, index }) => (

                <PlaceItem
                  block
                  image={api.URL + item.img}
                  title={item.title}
                  subtitle={item.subtitle}
                  location={item.address}
                  phone={item.phone}
                  rate={item.rate}
                  status={item.status}
                  rateStatus={item.rateStatus}
                  numReviews={item.numReviews}
                  style={{
                    borderBottomWidth: 0.5,
                    borderColor: BaseColor.textSecondaryColor,
                    marginBottom: 10
                  }}
                  onPress={() => navigation.navigate("PlaceDetail")}
                  onPressTag={() => navigation.navigate("Review")}
                />

              )}
            />
            <Animated.View
              style={[
                styles.navbar,
                { transform: [{ translateY: navbarTranslate }] }
              ]}
            >
              <FilterSort
                modeView={modeView}
                onChangeSort={(selected)=>{this.onChangeSort(selected)}}
                onChangeView={this.onChangeView}
                onFilter={this.onFilter}
              />
            </Animated.View>
          </View>
        );

      case "grid":
        return (
          <View style={{ flex: 1 }}>
            <Animated.FlatList
              contentInset={{ top: 50 }}
              contentContainerStyle={{
                marginTop: android ? 50 : 0
              }}
              columnWrapperStyle={{
                marginHorizontal: 20
              }}
              refreshControl={
                <RefreshControl
                  colors={[BaseColor.primaryColor]}
                  tintColor={BaseColor.primaryColor}
                  refreshing={refreshing}
                  onRefresh={() => {}}
                />
              }
              scrollEventThrottle={1}
              onScroll={Animated.event(
                [
                  {
                    nativeEvent: {
                      contentOffset: {
                        y: this.state.scrollAnim
                      }
                    }
                  }
                ],
                { useNativeDriver: true }
              )}
              showsVerticalScrollIndicator={false}
              numColumns={2}
              data={list}
              key={"gird"}
              keyExtractor={(item, index) => item.id}
              renderItem={({ item, index }) => (
                <PlaceItem
                  grid
                  image={api.URL + item.img}
                  title={item.title}
                  subtitle={item.subtitle}
                  location={item.address}
                  phone={item.phone}
                  rate={item.rate}
                  status={item.status}
                  rateStatus={item.rateStatus}
                  numReviews={item.numReviews}
                  style={
                    index % 2 == 0
                      ? {
                          marginBottom: 20
                        }
                      : {
                          marginLeft: 15,
                          marginBottom: 20
                        }
                  }
                  onPress={() => navigation.navigate("PlaceDetail")}
                  onPressTag={() => navigation.navigate("Review")}
                />
              )}
            />
            <Animated.View
              style={[
                styles.navbar,
                {
                  transform: [{ translateY: navbarTranslate }]
                }
              ]}
            >
              <FilterSort
                modeView={modeView}                
                onChangeSort={(selected)=>{this.onChangeSort(selected)}}
                onChangeView={this.onChangeView}
                onFilter={this.onFilter}
              />
            </Animated.View>
          </View>
        );

      case "list":
        return (
          <View style={{ flex: 1 }}>
            <Animated.FlatList
              style={{ paddingHorizontal: 20 }}
              contentInset={{ top: 50 }}
              contentContainerStyle={{
                marginTop: android ? 50 : 0
              }}
              refreshControl={
                <RefreshControl
                  colors={[BaseColor.primaryColor]}
                  tintColor={BaseColor.primaryColor}
                  refreshing={refreshing}
                  onRefresh={() => {}}
                />
              }
              scrollEventThrottle={1}
              onScroll={Animated.event(
                [
                  {
                    nativeEvent: {
                      contentOffset: {
                        y: this.state.scrollAnim
                      }
                    }
                  }
                ],
                { useNativeDriver: true }
              )}
              data={list}
              key={"list"}
              keyExtractor={(item, index) => item.id}
              renderItem={({ item, index }) => (
                <PlaceItem
                  list
                  image={api.URL + item.img}
                  title={item.title}
                  subtitle={item.subtitle}
                  location={item.address}
                  phone={item.phone}
                  rate={item.rate}
                  status={item.status}
                  rateStatus={item.rateStatus}
                  numReviews={item.numReviews}
                  style={{
                    marginBottom: 20
                  }}
                  onPress={() => navigation.navigate("PlaceDetail")}
                  onPressTag={() => navigation.navigate("Review")}
                />
              )}
            />
            <Animated.View
              style={[
                styles.navbar,
                {
                  transform: [{ translateY: navbarTranslate }]
                }
              ]}
            >
              <FilterSort
                modeView={modeView}                
                onChangeSort={(selected)=>{this.onChangeSort(selected)}}
                onChangeView={this.onChangeView}
                onFilter={this.onFilter}
              />
            </Animated.View>
          </View>
        );
      default:
        return (
          <View style={{ flex: 1 }}>
            <Animated.FlatList
              contentInset={{ top: 50 }}
              contentContainerStyle={{
                marginTop: android ? 50 : 0
              }}
              refreshControl={
                <RefreshControl
                  colors={[BaseColor.primaryColor]}
                  tintColor={BaseColor.primaryColor}
                  refreshing={refreshing}
                  onRefresh={() => {}}
                />
              }
              scrollEventThrottle={1}
              onScroll={Animated.event(
                [
                  {
                    nativeEvent: {
                      contentOffset: {
                        y: this.state.scrollAnim
                      }
                    }
                  }
                ],
                { useNativeDriver: true }
              )}
              data={list}
              key={"block"}
              keyExtractor={(item, index) => item.id}
              renderItem={({ item, index }) => (
                <PlaceItem
                  block
                  image={api.URL + item.img}
                  title={item.title}
                  subtitle={item.subtitle}
                  location={item.address}
                  phone={item.phone}
                  rate={item.rate}
                  status={item.status}
                  rateStatus={item.rateStatus}
                  numReviews={item.numReviews}
                  style={{
                    borderBottomWidth: 0.5,
                    borderColor: BaseColor.textSecondaryColor,
                    marginBottom: 10
                  }}
                  onPress={() => navigation.navigate("PlaceDetail")}
                  onPressTag={() => navigation.navigate("Review")}
                />
              )}
            />
            <Animated.View
              style={[
                styles.navbar,
                { transform: [{ translateY: navbarTranslate }] }
              ]}
            >
              <FilterSort
                modeView={modeView}
                onChangeSort={this.onChangeSort}
                onChangeView={this.onChangeView}
                onFilter={this.onFilter}
              />
            </Animated.View>
          </View>
        );
        break;
    }
  }

  renderMapView() {
    const { navigation } = this.props;
    const { region, list } = this.state;
    return (
      <View style={{ flex: 1 }}>
        <MapView
          ref={map => (this.map = map)}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
        >
          {list.map(item => {
            return (
              <Marker
                onPress={e => this.onSelectLocation(e.nativeEvent.coordinate)}
                key={item.id}
                coordinate={item.region}
              >
                <View
                  style={[
                    styles.iconLocation,
                    {
                      backgroundColor: item.active
                        ? BaseColor.primaryColor
                        : BaseColor.whiteColor
                    }
                  ]}
                >
                  <Icon
                    name="star"
                    size={16}
                    color={
                      item.active
                        ? BaseColor.whiteColor
                        : BaseColor.primaryColor
                    }
                  />
                </View>
              </Marker>
            );
          })}
        </MapView>
        <View style={{ position: "absolute", bottom: 0 }}>
          {/* <View style={{ padding: 30, alignItems: "flex-end" }}>
            <TouchableOpacity
              style={styles.followLocationIcon}
              activeOpacity={0.7}
              onPress={() => {}}
            >
              <Icon name="crosshairs" size={16} color={BaseColor.accentColor} />
            </TouchableOpacity>
          </View> */}
          <FlatList
            ref={ref => {
              this.flatListRef = ref;
            }}
            showsHorizontalScrollIndicator={false}
            horizontal={true}
            data={list}
            onMomentumScrollEnd={event => {
              const index = Number(
                event.nativeEvent.contentOffset.x / 300
              ).toFixed();
              this.setState({
                list: list.map((item, i) => {
                  return {
                    ...item,
                    active: i == index
                  };
                }),
                region: {
                  latitudeDelta: 0.009,
                  longitudeDelta: 0.004,
                  latitude: list[index] && list[index].lat,
                  longitude: list[index] && list[index].lng
                }
              });
            }}
            keyExtractor={(item, index) => item.id}
            renderItem={({ item, index }) => (
              <CardList
                image={{uri:api.URL +  item.img}}
                title={item.title}
                subtitle={item.subtitle}
                rate={item.rate}
                style={{
                  padding: 10,
                  width: 300,
                  marginBottom: 20,
                  marginHorizontal: 10,
                  backgroundColor: BaseColor.whiteColor,
                  borderRadius: 8,
                  shadowColor: item.active
                    ? BaseColor.lightPrimaryColor
                    : "black",
                  shadowOffset: {
                    width: 0,
                    height: 2
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5
                }}
                onPress={() => navigation.navigate("PlaceDetail")}
                onPressTag={() => navigation.navigate("Review")}
              />
            )}
          />
        </View>
      </View>
    );
  }

  render() {
    const { navigation } = this.props;
    const { mapView } = this.state;
    return (
      <SafeAreaView
        style={BaseStyle.safeAreaView}
        forceInset={{ top: "always" }}
      >
        <Header
          title="Mexicana"
          renderRight={() => {
            return (
              <Icon
                name={mapView ? "align-right" : "map"}
                size={20}
                color={BaseColor.primaryColor}
              />
            );
          }}
          
          renderRightSecond={() => {
            return (
              <Icon name="search" size={24} color={BaseColor.primaryColor} />
            );
          }}
          onPressRightSecond={() => {
            navigation.navigate("SearchHistory");
          }}
          onPressLeft={() => {
            navigation.goBack();
          }}
          onPressRight={() => {
            this.onChangeMapView();
          }}
        />

        {mapView ? this.renderMapView() : this.renderList()}
      </SafeAreaView>
    );
  }
}


const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return {
      actions: bindActionCreators(ResAction, dispatch)    
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Place);



