import React, { Component } from "react";
import { View, TouchableOpacity } from "react-native";
import { BaseColor } from "@config";
import { Text, Icon , Image} from "@components";
import styles from "./styles";
import PropTypes from "prop-types";

export default class CategoryIcon extends Component {
  render() {
    const { style, icon, image, title, subtitle, onPress } = this.props;
    return (
      <TouchableOpacity
        style={[styles.contain, style]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        
        
        <View style={styles.iconContent}>
          <Image source={{uri:image}}  style={{ width:40,height:40 }} />
          {/* <Icon name={icon} size={32} color={BaseColor.whiteColor} solid /> */}
        </View>
        <View style={{ padding: 10 }}>
          <Text headline semibold>
            {title}
          </Text>
          <Text footnote semibold grayColor style={{ marginTop: 5 }}>
            {subtitle}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}

CategoryIcon.propTypes = {
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  icon: PropTypes.node.isRequired,
  image: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  onPress: PropTypes.func
};

CategoryIcon.defaultProps = {
  style: {},
  image: "",
  icon: "",
  title: "",
  subtitle: "",
  onPress: () => {}
};
